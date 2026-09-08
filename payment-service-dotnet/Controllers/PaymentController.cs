using Microsoft.AspNetCore.Mvc;
using PaymentService.Models;
using PaymentService.Services;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        /// <summary>
        /// POST /api/payments
        /// Process a new payment — same as Node.js processPayment controller
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.BookingId) ||
                    string.IsNullOrEmpty(request.UserId) ||
                    string.IsNullOrEmpty(request.PaymentMethod) ||
                    request.Amount <= 0)
                {
                    return BadRequest(new { message = "bookingId, userId, amount, and paymentMethod are required" });
                }

                var payment = await _paymentService.ProcessPaymentAsync(request);

                return StatusCode(201, new
                {
                    message = "Payment processed successfully",
                    payment
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Payment processing failed");
                return StatusCode(500, new { message = "Payment processing failed", error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/payments/admin/all
        /// Get all payments — admin route
        /// NOTE: Must be defined BEFORE /:bookingId route to avoid route conflict
        /// </summary>
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllPayments()
        {
            try
            {
                var payments = await _paymentService.GetAllPaymentsAsync();
                return Ok(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch all payments");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/payments/booking/:bookingId
        /// Get payment details by booking ID
        /// </summary>
        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetPaymentByBooking(string bookingId)
        {
            try
            {
                var payment = await _paymentService.GetPaymentByBookingIdAsync(bookingId);

                if (payment == null)
                {
                    return NotFound(new { message = "No payment found for this booking" });
                }

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch payment for booking {BookingId}", bookingId);
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
