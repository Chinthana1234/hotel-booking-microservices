using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PaymentService.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        /// <summary>
        /// Creates the Payments table with all columns, constraints, and indexes.
        /// This runs automatically on startup when ASPNETCORE_ENVIRONMENT=Development
        /// and StorageSettings:Provider=SqlServer.
        /// </summary>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    // GUID primary key — set by the application, not SQL Server
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),

                    // Cross-service references stored as strings (MongoDB ObjectIds)
                    BookingId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserId    = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),

                    // decimal(18,2) — SQL Server standard for financial amounts
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),

                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),

                    // "Pending" | "Completed" | "Failed"
                    Status = table.Column<string>(
                        type: "nvarchar(20)",
                        maxLength: 20,
                        nullable: false,
                        defaultValue: "Completed"),

                    // Nullable — only populated for PayPal payments
                    PayPalOrderId   = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PayPalCaptureId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),

                    // UTC timestamps — set by the application
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                });

            // ── Indexes ──────────────────────────────────────────────────────────

            // Most common read: "get payment for booking X"
            migrationBuilder.CreateIndex(
                name: "IX_Payments_BookingId",
                table: "Payments",
                column: "BookingId");

            // "Get all payments by user Y"
            migrationBuilder.CreateIndex(
                name: "IX_Payments_UserId",
                table: "Payments",
                column: "UserId");

            // Admin dashboard — filter by status
            migrationBuilder.CreateIndex(
                name: "IX_Payments_Status",
                table: "Payments",
                column: "Status");

            // ORDER BY CreatedAt DESC (newest first)
            migrationBuilder.CreateIndex(
                name: "IX_Payments_CreatedAt",
                table: "Payments",
                column: "CreatedAt");

            // Composite — covers: WHERE Status = ? ORDER BY CreatedAt DESC
            migrationBuilder.CreateIndex(
                name: "IX_Payments_Status_CreatedAt",
                table: "Payments",
                columns: new[] { "Status", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Payments");
        }
    }
}
