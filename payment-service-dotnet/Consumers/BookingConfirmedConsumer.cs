using MassTransit;
using PaymentService.Events;
using PaymentService.Models;
using PaymentService.Services;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;

namespace PaymentService.Consumers
{
    public class BookingConfirmedConsumer : IConsumer<BookingConfirmed>
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<BookingConfirmedConsumer> _logger;
        private readonly IPublishEndpoint _publishEndpoint;

        public BookingConfirmedConsumer(IPaymentService paymentService, ILogger<BookingConfirmedConsumer> logger, IPublishEndpoint publishEndpoint)
        {
            _paymentService = paymentService;
            _logger = logger;
            _publishEndpoint = publishEndpoint;
        }

        public async Task Consume(ConsumeContext<BookingConfirmed> context)
        {
            var msg = context.Message;
            _logger.LogInformation("Received BookingConfirmed for BookingId: {BookingId}, Amount: {Amount}", msg.BookingId, msg.Amount);

            try
            {
                // Create a pending payment record or directly process it if you want to simulate auto-payment
                var request = new ProcessPaymentRequest
                {
                    BookingId = msg.BookingId,
                    UserId = msg.UserId,
                    Amount = msg.Amount,
                    PaymentMethod = "System" // Or auto-charged method
                };

                // Assuming we just create it in the database via ProcessPaymentAsync without a real token (simulate success)
                var payment = await _paymentService.ProcessPaymentAsync(request, null, null);

                // Publish success event
                await _publishEndpoint.Publish<PaymentCompleted>(new
                {
                    PaymentId = payment.Id,
                    BookingId = payment.BookingId,
                    Status = payment.Status
                });
                
                _logger.LogInformation("Payment created and PaymentCompleted event published for BookingId: {BookingId}", msg.BookingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process payment for BookingId: {BookingId}", msg.BookingId);

                // Publish failure event
                await _publishEndpoint.Publish<PaymentFailed>(new
                {
                    BookingId = msg.BookingId,
                    Reason = ex.Message
                });
                
                // Throwing the exception enables MassTransit to retry the message or move it to a dead-letter queue (error queue)
                throw;
            }
        }
    }
}
