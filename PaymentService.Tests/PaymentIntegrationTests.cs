using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using PaymentService.Data;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using System.Collections.Generic;
using System.Net.Http.Json;
using PaymentService.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System;

namespace PaymentService.Tests
{
    public class PaymentIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;
        private readonly string _jwtSecret = "supersecretkey12345678901234567890"; // must match fallback or set config

        public PaymentIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                // Force EF Core SQL Server path to test that branch
                builder.ConfigureAppConfiguration((context, config) =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        { "StorageSettings:Provider", "SqlServer" },
                        { "JWT_SECRET", _jwtSecret }
                    });
                });

                builder.ConfigureServices(services =>
                {
                    // Remove the existing DbContext configuration
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<PaymentDbContext>));

                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Add a database context using an in-memory database for testing
                    services.AddDbContext<PaymentDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("InMemoryDbForTesting");
                    });
                });
            });

            _client = _factory.CreateClient();
        }

        private string GenerateTestJwt(bool isAdmin)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", "testuser_id"),
                    new Claim("isAdmin", isAdmin ? "true" : "false")
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [Fact]
        public async Task ProcessPayment_WithoutToken_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.PostAsJsonAsync("/api/payments", new ProcessPaymentRequest
            {
                BookingId = "B1",
                UserId = "U1",
                Amount = 100,
                PaymentMethod = "Card"
            });

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task ProcessPayment_WithToken_ReturnsCreated()
        {
            // Arrange
            var token = GenerateTestJwt(isAdmin: false);
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.PostAsJsonAsync("/api/payments", new ProcessPaymentRequest
            {
                BookingId = "B1",
                UserId = "U1",
                Amount = 100,
                PaymentMethod = "Card"
            });

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<ProcessPaymentResponse>();
            Assert.NotNull(result);
            Assert.Equal("Payment processed successfully", result.Message);
        }

        [Fact]
        public async Task GetAllPayments_AsUser_ReturnsForbidden()
        {
            // Arrange
            var token = GenerateTestJwt(isAdmin: false);
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/payments/admin/all");

            // Assert
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task GetAllPayments_AsAdmin_ReturnsOk()
        {
            // Arrange
            var token = GenerateTestJwt(isAdmin: true);
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/payments/admin/all");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}
