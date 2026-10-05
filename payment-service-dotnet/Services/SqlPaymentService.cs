using PaymentService.Data.Entities;
using PaymentService.Data.Repositories;
using PaymentService.Models;

namespace PaymentService.Services;

/// <summary>
/// SQL Server–backed implementation of <see cref="IPaymentService"/>.
///
/// This class sits between the controller (which knows nothing about persistence)
/// and the repository (which knows nothing about the API model). Its job is:
///   1. Map the API request DTO → EF Core entity (for writes).
///   2. Call the repository.
///   3. Map the EF Core entity → API response model (for reads).
///
/// WHY keep this separate from SqlPaymentRepository?
///   • The repository is purely data-access: INSERT, SELECT, etc.
///   • The service holds business rules: status defaults, logging, future
///     validation (e.g. "is this booking already paid?").
///   • Having both also lets unit tests mock the repository and test the
///     service logic in isolation.
///
/// WHY does this implement IPaymentService (not a new interface)?
///   The controller already depends on IPaymentService, so wiring a second
///   implementation requires zero changes to PaymentController.cs.
/// </summary>
public class SqlPaymentService : IPaymentService
{
    private readonly IPaymentRepository _repo;
    private readonly ILogger<SqlPaymentService> _logger;

    public SqlPaymentService(IPaymentRepository repo, ILogger<SqlPaymentService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    /// <summary>
    /// Save a new payment to SQL Server and return the API response model.
    /// The GUID is generated here (not in the DB) so it can be included in
    /// a RabbitMQ event before the INSERT is acknowledged (Step 5).
    /// </summary>
    public async Task<Payment> ProcessPaymentAsync(
        ProcessPaymentRequest request,
        string? paypalOrderId = null,
        string? paypalCaptureId = null)
    {
        var entity = new PaymentEntity
        {
            Id            = Guid.NewGuid(),             // app-generated — no DB round-trip needed
            BookingId     = request.BookingId,
            UserId        = request.UserId,
            Amount        = (decimal)request.Amount,    // double → decimal for SQL precision
            PaymentMethod = request.PaymentMethod,
            Status        = "Completed",                // simulated — always succeeds (portfolio scope)
            PayPalOrderId = paypalOrderId,
            PayPalCaptureId = paypalCaptureId,
            CreatedAt     = DateTime.UtcNow,
            UpdatedAt     = DateTime.UtcNow,
        };

        var saved = await _repo.AddAsync(entity);

        _logger.LogInformation(
            "[SQL] Payment saved — Id={Id}, BookingId={BookingId}, Amount={Amount}, Method={Method}",
            saved.Id, saved.BookingId, saved.Amount, saved.PaymentMethod);

        return MapToApiModel(saved);
    }

    /// <inheritdoc/>
    public async Task<Payment?> GetPaymentByBookingIdAsync(string bookingId)
    {
        var entity = await _repo.GetByBookingIdAsync(bookingId);
        return entity is null ? null : MapToApiModel(entity);
    }

    /// <inheritdoc/>
    public async Task<List<Payment>> GetAllPaymentsAsync()
    {
        var entities = await _repo.GetAllAsync();
        return entities.Select(MapToApiModel).ToList();
    }

    // ── Mapping ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Convert a SQL entity into the Payment model that the controller returns.
    ///
    /// Notes:
    ///   • Id is serialised as a GUID string — different from MongoDB's ObjectId
    ///     string, but the frontend only stores and echoes it, so this is safe.
    ///   • Amount is cast back to double to preserve the existing API contract;
    ///     the precision lost here is 0 because decimal(18,2) fits in double.
    /// </summary>
    private static Payment MapToApiModel(PaymentEntity e) => new()
    {
        Id              = e.Id.ToString(),
        BookingId       = e.BookingId,
        UserId          = e.UserId,
        Amount          = (double)e.Amount,
        PaymentMethod   = e.PaymentMethod,
        Status          = e.Status,
        PayPalOrderId   = e.PayPalOrderId,
        PayPalCaptureId = e.PayPalCaptureId,
        CreatedAt       = e.CreatedAt,
        UpdatedAt       = e.UpdatedAt,
    };
}
