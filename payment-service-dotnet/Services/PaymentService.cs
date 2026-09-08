using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PaymentService.Models;

namespace PaymentService.Services
{
    public interface IPaymentService
    {
        Task<Payment> ProcessPaymentAsync(ProcessPaymentRequest request);
        Task<Payment?> GetPaymentByBookingIdAsync(string bookingId);
        Task<List<Payment>> GetAllPaymentsAsync();
    }

    /// <summary>
    /// MongoDB-backed payment service
    /// Same logic as paymentController.js — just in C#
    /// </summary>
    public class MongoPaymentService : IPaymentService
    {
        private readonly IMongoCollection<Payment> _payments;
        private readonly ILogger<MongoPaymentService> _logger;

        public MongoPaymentService(IOptions<MongoDbSettings> mongoSettings, ILogger<MongoPaymentService> logger)
        {
            var client = new MongoClient(mongoSettings.Value.ConnectionString);
            var database = client.GetDatabase(mongoSettings.Value.DatabaseName);
            _payments = database.GetCollection<Payment>(mongoSettings.Value.CollectionName);
            _logger = logger;
        }

        /// <summary>
        /// Process a new payment — simulates successful transaction
        /// Same behaviour as Node.js: status is always "Completed"
        /// </summary>
        public async Task<Payment> ProcessPaymentAsync(ProcessPaymentRequest request)
        {
            var payment = new Payment
            {
                BookingId = request.BookingId,
                UserId = request.UserId,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                Status = "Completed", // Simulating a successful transaction
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _payments.InsertOneAsync(payment);
            _logger.LogInformation("Payment processed: BookingId={BookingId}, Amount={Amount}", request.BookingId, request.Amount);
            return payment;
        }

        /// <summary>
        /// Get payment by booking ID
        /// </summary>
        public async Task<Payment?> GetPaymentByBookingIdAsync(string bookingId)
        {
            return await _payments
                .Find(p => p.BookingId == bookingId)
                .FirstOrDefaultAsync();
        }

        /// <summary>
        /// Get all payments — sorted by newest first (admin view)
        /// </summary>
        public async Task<List<Payment>> GetAllPaymentsAsync()
        {
            return await _payments
                .Find(_ => true)
                .SortByDescending(p => p.CreatedAt)
                .ToListAsync();
        }
    }
}
