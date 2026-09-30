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
        private readonly IPayPalService _payPalService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, IPayPalService payPalService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _payPalService = payPalService;
            _logger = logger;
        }

        /// <summary>
        /// POST /api/payments
        /// Process a new payment (non-PayPal methods like credit card)
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

        // ──────────────────────────────────────────
        // PayPal Integration Endpoints
        // ──────────────────────────────────────────

        /// <summary>
        /// POST /api/payments/paypal/create-order
        /// Create a PayPal order — frontend calls this, then opens PayPal popup
        /// </summary>
        [HttpPost("paypal/create-order")]
        public async Task<IActionResult> CreatePayPalOrder([FromBody] PayPalCreateOrderRequest request)
        {
            try
            {
                if (request.Amount <= 0)
                {
                    return BadRequest(new { message = "Amount must be greater than 0" });
                }

                var result = await _payPalService.CreateOrderAsync(request.Amount, request.Currency);

                return Ok(new
                {
                    orderId = result.OrderId,
                    status = result.Status,
                    approvalUrl = result.ApprovalUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PayPal create order failed");
                return StatusCode(500, new { message = "Failed to create PayPal order", error = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/payments/paypal/capture-order
        /// Capture a PayPal order after user approval — saves payment to MongoDB
        /// </summary>
        [HttpPost("paypal/capture-order")]
        public async Task<IActionResult> CapturePayPalOrder([FromBody] PayPalCaptureOrderRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.OrderId))
                {
                    return BadRequest(new { message = "PayPal orderId is required" });
                }

                // 1. Capture the payment on PayPal
                var captureResult = await _payPalService.CaptureOrderAsync(request.OrderId);

                if (captureResult.Status != "COMPLETED")
                {
                    return StatusCode(400, new
                    {
                        message = "PayPal payment was not completed",
                        status = captureResult.Status
                    });
                }

                // 2. Save payment record to MongoDB
                var payment = await _paymentService.ProcessPaymentAsync(new ProcessPaymentRequest
                {
                    BookingId = request.BookingId,
                    UserId = request.UserId,
                    Amount = request.Amount,
                    PaymentMethod = "PayPal"
                }, captureResult.OrderId, captureResult.CaptureId);

                return StatusCode(201, new
                {
                    message = "PayPal payment captured successfully",
                    payment,
                    paypal = new
                    {
                        orderId = captureResult.OrderId,
                        captureId = captureResult.CaptureId,
                        status = captureResult.Status
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PayPal capture failed for order {OrderId}", request.OrderId);
                return StatusCode(500, new { message = "Failed to capture PayPal payment", error = ex.Message });
            }
        }
    }
}

