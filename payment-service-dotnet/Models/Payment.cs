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
    /// MongoDB settings — bound from appsettings.json
    /// </summary>
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
    }
}
