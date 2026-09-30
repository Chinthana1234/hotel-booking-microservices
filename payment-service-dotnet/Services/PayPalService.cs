using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using PaymentService.Models;

namespace PaymentService.Services
{
    /// <summary>
    /// PayPal REST API settings — bound from appsettings.json
    /// </summary>
    public class PayPalSettings
    {
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string Mode { get; set; } = "sandbox"; // "sandbox" or "live"

        public string BaseUrl => Mode == "live"
            ? "https://api-m.paypal.com"
            : "https://api-m.sandbox.paypal.com";
    }

    public interface IPayPalService
    {
        Task<PayPalCreateOrderResponse> CreateOrderAsync(double amount, string currency = "USD");
        Task<PayPalCaptureResponse> CaptureOrderAsync(string orderId);
    }

    /// <summary>
    /// PayPal REST API v2 integration
    /// - Creates orders via POST /v2/checkout/orders
    /// - Captures payments via POST /v2/checkout/orders/{id}/capture
    /// </summary>
    public class PayPalService : IPayPalService
    {
        private readonly PayPalSettings _settings;
        private readonly HttpClient _httpClient;
        private readonly ILogger<PayPalService> _logger;

        public PayPalService(IOptions<PayPalSettings> settings, HttpClient httpClient, ILogger<PayPalService> logger)
        {
            _settings = settings.Value;
            _httpClient = httpClient;
            _logger = logger;
        }

        /// <summary>
        /// Get an OAuth2 access token from PayPal using client credentials
        /// </summary>
        private async Task<string> GetAccessTokenAsync()
        {
            var credentials = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{_settings.ClientId}:{_settings.ClientSecret}"));

            var request = new HttpRequestMessage(HttpMethod.Post, $"{_settings.BaseUrl}/v1/oauth2/token");
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
            request.Content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials")
            });

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("PayPal auth failed: {Response}", json);
                throw new Exception($"PayPal authentication failed: {response.StatusCode}");
            }

            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("access_token").GetString()
                ?? throw new Exception("No access_token in PayPal response");
        }

        /// <summary>
        /// Create a PayPal order — returns the order ID and approval URL
        /// </summary>
        public async Task<PayPalCreateOrderResponse> CreateOrderAsync(double amount, string currency = "USD")
        {
            var accessToken = await GetAccessTokenAsync();

            var orderPayload = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new
                    {
                        amount = new
                        {
                            currency_code = currency,
                            value = amount.ToString("F2")
                        },
                        description = "Hotel Booking Payment - The Grand Ceylon"
                    }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, $"{_settings.BaseUrl}/v2/checkout/orders");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent(
                JsonSerializer.Serialize(orderPayload),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("PayPal create order failed: {Response}", json);
                throw new Exception($"PayPal create order failed: {response.StatusCode}");
            }

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var orderId = root.GetProperty("id").GetString()!;
            var status = root.GetProperty("status").GetString()!;

            // Find the approval link
            string? approvalUrl = null;
            foreach (var link in root.GetProperty("links").EnumerateArray())
            {
                if (link.GetProperty("rel").GetString() == "approve")
                {
                    approvalUrl = link.GetProperty("href").GetString();
                    break;
                }
            }

            _logger.LogInformation("PayPal order created: {OrderId}, Status: {Status}", orderId, status);

            return new PayPalCreateOrderResponse
            {
                OrderId = orderId,
                Status = status,
                ApprovalUrl = approvalUrl
            };
        }

        /// <summary>
        /// Capture a PayPal order after user approval
        /// </summary>
        public async Task<PayPalCaptureResponse> CaptureOrderAsync(string orderId)
        {
            var accessToken = await GetAccessTokenAsync();

            var request = new HttpRequestMessage(HttpMethod.Post,
                $"{_settings.BaseUrl}/v2/checkout/orders/{orderId}/capture");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent("{}", Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("PayPal capture failed: {Response}", json);
                throw new Exception($"PayPal capture failed: {response.StatusCode}");
            }

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var status = root.GetProperty("status").GetString()!;
            string? captureId = null;
            double capturedAmount = 0;

            // Extract capture details from the response
            try
            {
                var captures = root.GetProperty("purchase_units")[0]
                    .GetProperty("payments")
                    .GetProperty("captures")[0];

                captureId = captures.GetProperty("id").GetString();
                var amountStr = captures.GetProperty("amount").GetProperty("value").GetString();
                if (amountStr != null) double.TryParse(amountStr, out capturedAmount);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not extract capture details from PayPal response");
            }

            _logger.LogInformation("PayPal order captured: {OrderId}, CaptureId: {CaptureId}, Status: {Status}",
                orderId, captureId, status);

            return new PayPalCaptureResponse
            {
                OrderId = orderId,
                CaptureId = captureId,
                Status = status,
                Amount = capturedAmount
            };
        }
    }
}
