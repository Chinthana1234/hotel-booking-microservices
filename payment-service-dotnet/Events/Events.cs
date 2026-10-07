namespace PaymentService.Events
{
    public interface BookingConfirmed
    {
        string BookingId { get; }
        string UserId { get; }
        string RoomId { get; }
        double Amount { get; }
        string Timestamp { get; }
    }

    public interface PaymentCompleted
    {
        string PaymentId { get; }
        string BookingId { get; }
        string Status { get; }
    }

    public interface PaymentFailed
    {
        string BookingId { get; }
        string Reason { get; }
    }
}
