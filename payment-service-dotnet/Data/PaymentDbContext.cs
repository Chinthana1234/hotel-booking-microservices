using Microsoft.EntityFrameworkCore;
using PaymentService.Data.Entities;

namespace PaymentService.Data;

/// <summary>
/// EF Core DbContext for the Payment Service.
///
/// WHY use Fluent API instead of Data Annotations?
///   Annotations mix infrastructure concerns into the entity class (which is
///   a domain object). Fluent API keeps all SQL-specific config here, in the
///   infrastructure layer, so <see cref="PaymentEntity"/> stays a pure POCO.
///
/// INDEXES ADDED:
///   • IX_Payments_BookingId       — fast lookup: "get payment for booking X"
///   • IX_Payments_UserId          — fast lookup: "get all payments by user Y"
///   • IX_Payments_Status          — filter by status on admin dashboard
///   • IX_Payments_CreatedAt       — ORDER BY for latest-first sorting
///   • IX_Payments_Status_CreatedAt — composite: admin view filtered + sorted
/// </summary>
public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options) { }

    /// <summary>The Payments table.</summary>
    public DbSet<PaymentEntity> Payments => Set<PaymentEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PaymentEntity>(entity =>
        {
            // ── Table ──────────────────────────────────────────────────────
            entity.ToTable("Payments");

            // ── Primary Key ────────────────────────────────────────────────
            // GUID PK — no database IDENTITY column so the ID is known before
            // the row is inserted (important for event publishing in Step 5).
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                  .ValueGeneratedNever(); // App sets the GUID, not SQL Server

            // ── String columns — max lengths prevent nvarchar(MAX) ─────────
            entity.Property(e => e.BookingId)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(e => e.UserId)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(e => e.PaymentMethod)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.Property(e => e.Status)
                  .IsRequired()
                  .HasMaxLength(20)
                  .HasDefaultValue("Completed");

            entity.Property(e => e.PayPalOrderId)
                  .HasMaxLength(100);

            entity.Property(e => e.PayPalCaptureId)
                  .HasMaxLength(100);

            // ── Amount — decimal(18,2) is the SQL Server standard for money ─
            entity.Property(e => e.Amount)
                  .IsRequired()
                  .HasColumnType("decimal(18,2)");

            // ── Timestamps — UTC, set by application ───────────────────────
            entity.Property(e => e.CreatedAt)
                  .IsRequired();

            entity.Property(e => e.UpdatedAt)
                  .IsRequired();

            // ── Indexes ────────────────────────────────────────────────────
            entity.HasIndex(e => e.BookingId)
                  .HasDatabaseName("IX_Payments_BookingId");

            entity.HasIndex(e => e.UserId)
                  .HasDatabaseName("IX_Payments_UserId");

            entity.HasIndex(e => e.Status)
                  .HasDatabaseName("IX_Payments_Status");

            entity.HasIndex(e => e.CreatedAt)
                  .HasDatabaseName("IX_Payments_CreatedAt");

            // Composite index — used by admin dashboard: WHERE Status = X ORDER BY CreatedAt DESC
            entity.HasIndex(e => new { e.Status, e.CreatedAt })
                  .HasDatabaseName("IX_Payments_Status_CreatedAt");
        });
    }
}
