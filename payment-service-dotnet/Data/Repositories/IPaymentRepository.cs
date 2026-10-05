using PaymentService.Data.Entities;

namespace PaymentService.Data.Repositories;

/// <summary>
/// Repository abstraction for payment persistence.
///
/// WHY a repository interface on top of DbContext?
///   • The controller and service tests can mock this interface without needing
///     a real database or an in-memory EF context.
///   • If we ever swap SQL Server for another store (e.g. Cosmos DB), only the
///     implementation changes — nothing above this layer is touched.
///   • CancellationToken on every method lets ASP.NET cancel in-flight queries
///     when the HTTP client disconnects.
/// </summary>
public interface IPaymentRepository
{
    /// <summary>
    /// Persist a new payment record and return the saved entity.
    /// The caller is responsible for setting <see cref="PaymentEntity.Id"/> before calling.
    /// </summary>
    Task<PaymentEntity> AddAsync(PaymentEntity entity, CancellationToken ct = default);

    /// <summary>
    /// Find the most recent payment for a given booking.
    /// Returns <see langword="null"/> if no record is found.
    /// </summary>
    Task<PaymentEntity?> GetByBookingIdAsync(string bookingId, CancellationToken ct = default);

    /// <summary>
    /// Return all payments, newest first. Used by the admin dashboard.
    /// </summary>
    Task<IReadOnlyList<PaymentEntity>> GetAllAsync(CancellationToken ct = default);
}
