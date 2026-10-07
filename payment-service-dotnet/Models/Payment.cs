using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PaymentService.Models
{
    /// <summary>
    /// Payment model — mirrors the existing Node.js Payment.js schema exactly
    /// so it reads/writes to the same MongoDB collection
    /// </summary>
    public class Payment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("bookingId")]
        public string BookingId { get; set; } = string.Empty;

        [BsonElement("userId")]
        public string UserId { get; set; } = string.Empty;

        [BsonElement("amount")]
        public double Amount { get; set; }

        [BsonElement("paymentMethod")]
        public string PaymentMethod { get; set; } = string.Empty;

        // Enum: "Pending" | "Completed" | "Failed"
        [BsonElement("status")]
        public string Status { get; set; } = "Completed";

        [BsonElement("paypalOrderId")]
        [BsonIgnoreIfNull]
        public string? PayPalOrderId { get; set; }

        [BsonElement("paypalCaptureId")]
        [BsonIgnoreIfNull]
        public string? PayPalCaptureId { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Request DTO for processing a new payment
    /// </summary>
    public class ProcessPaymentRequest
    {
        public string BookingId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public double Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response DTO for returning payment details to clients
    /// </summary>
    public class PaymentResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string BookingId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public double Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? PayPalOrderId { get; set; }
        public string? PayPalCaptureId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ProcessPaymentResponse
    {
        public string Message { get; set; } = string.Empty;
        public PaymentResponseDto Payment { get; set; } = null!;
    }

    public class PayPalCaptureData
    {
        public string OrderId { get; set; } = string.Empty;
        public string? CaptureId { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class PayPalCapturePaymentResponse
    {
        public string Message { get; set; } = string.Empty;
        public PaymentResponseDto Payment { get; set; } = null!;
        public PayPalCaptureData Paypal { get; set; } = null!;
    }

    /// <summary>
    /// Request DTO for creating a PayPal order
    /// </summary>
    public class PayPalCreateOrderRequest
    {
        public double Amount { get; set; }
        public string Currency { get; set; } = "USD";
    }

    /// <summary>
    /// Response DTO from PayPal order creation
    /// </summary>
    public class PayPalCreateOrderResponse
    {
        public string OrderId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ApprovalUrl { get; set; }
    }

    /// <summary>
    /// Request DTO for capturing a PayPal order
    /// </summary>
    public class PayPalCaptureOrderRequest
    {
        public string OrderId { get; set; } = string.Empty;
        public string BookingId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public double Amount { get; set; }
    }

    /// <summary>
    /// Response DTO from PayPal order capture
    /// </summary>
    public class PayPalCaptureResponse
    {
        public string OrderId { get; set; } = string.Empty;
        public string? CaptureId { get; set; }
        public string Status { get; set; } = string.Empty;
        public double Amount { get; set; }
    }

    /// <summary>
    /// MongoDB settings — bound from appsettings.json
    /// </summary>
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
    }
}
