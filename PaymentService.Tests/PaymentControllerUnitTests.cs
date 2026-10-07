using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using PaymentService.Controllers;
using PaymentService.Models;
using PaymentService.Services;
using System;
using System.Threading.Tasks;
using Xunit;

namespace PaymentService.Tests
{
    public class PaymentControllerUnitTests
    {
        private readonly Mock<IPaymentService> _mockPaymentService;
        private readonly Mock<IPayPalService> _mockPayPalService;
        private readonly Mock<ILogger<PaymentController>> _mockLogger;
        private readonly PaymentController _controller;

        public PaymentControllerUnitTests()
        {
            _mockPaymentService = new Mock<IPaymentService>();
            _mockPayPalService = new Mock<IPayPalService>();
            _mockLogger = new Mock<ILogger<PaymentController>>();
            
            _controller = new PaymentController(
                _mockPaymentService.Object,
                _mockPayPalService.Object,
                _mockLogger.Object
            );
        }

        [Fact]
        public async Task ProcessPayment_Returns201_WhenSuccessful()
        {
            // Arrange
            var request = new ProcessPaymentRequest
            {
                BookingId = "B123",
                UserId = "U123",
                Amount = 100.50,
                PaymentMethod = "CreditCard"
            };

            var expectedPayment = new Payment 
            { 
                Id = "P123", 
                BookingId = "B123",
                UserId = "U123",
                Amount = 100.50,
                PaymentMethod = "CreditCard",
                Status = "Completed"
            };

            _mockPaymentService.Setup(s => s.ProcessPaymentAsync(request, null, null))
                .ReturnsAsync(expectedPayment);

            // Act
            var result = await _controller.ProcessPayment(request);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(201, statusCodeResult.StatusCode);
            
            var responseDto = Assert.IsType<ProcessPaymentResponse>(statusCodeResult.Value);
            Assert.Equal("Payment processed successfully", responseDto.Message);
            Assert.Equal("B123", responseDto.Payment.BookingId);
        }

        [Theory]
        [InlineData("", "U123", 100, "Card")]
        [InlineData("B123", "", 100, "Card")]
        [InlineData("B123", "U123", 0, "Card")]
        [InlineData("B123", "U123", 100, "")]
        public async Task ProcessPayment_ReturnsBadRequest_WhenValidationFails(
            string bookingId, string userId, double amount, string paymentMethod)
        {
            // Arrange
            var request = new ProcessPaymentRequest
            {
                BookingId = bookingId,
                UserId = userId,
                Amount = amount,
                PaymentMethod = paymentMethod
            };

            // Act
            var result = await _controller.ProcessPayment(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
        }

        [Fact]
        public async Task ProcessPayment_Returns500_WhenServiceThrowsException()
        {
            // Arrange
            var request = new ProcessPaymentRequest
            {
                BookingId = "B123",
                UserId = "U123",
                Amount = 100,
                PaymentMethod = "Card"
            };

            _mockPaymentService.Setup(s => s.ProcessPaymentAsync(It.IsAny<ProcessPaymentRequest>(), null, null))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.ProcessPayment(request);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }
    }
}
