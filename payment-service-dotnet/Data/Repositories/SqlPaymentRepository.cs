using Microsoft.EntityFrameworkCore;
using PaymentService.Data.Entities;

namespace PaymentService.Data.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IPaymentRepository"/>.
///
/// WHY AsNoTracking() on reads?
///   Read-only queries (GET endpoints) don't need EF's change-tracker.
///   AsNoTracking() skips building the identity map snapshot, which is
///   measurably faster and uses less memory for large result sets.
///
/// WHY not use a Unit-of-Work / IUnitOfWork here?
///   For a microservice that owns a single aggregate (Payment), the DbContext
///   already acts as the unit of work. An extra UoW wrapper would be ceremony
///   without benefit at this scale.
/// </summary>
public class SqlPaymentRepository : IPaymentRepository
{
    private readonly PaymentDbContext _db;

    public SqlPaymentRepository(PaymentDbContext db)
    {
        _db = db;
    }

    /// <inheritdoc/>
    public async Task<PaymentEntity> AddAsync(PaymentEntity entity, CancellationToken ct = default)
    {
        _db.Payments.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    /// <inheritdoc/>
    public async Task<PaymentEntity?> GetByBookingIdAsync(string bookingId, CancellationToken ct = default)
        => await _db.Payments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.BookingId == bookingId, ct);

    /// <inheritdoc/>
    public async Task<IReadOnlyList<PaymentEntity>> GetAllAsync(CancellationToken ct = default)
        => await _db.Payments
                    .AsNoTracking()
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync(ct);
}
