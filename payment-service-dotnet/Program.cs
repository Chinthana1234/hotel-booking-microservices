using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Data.Repositories;
using PaymentService.Models;
using PaymentService.Services;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────────────────────────────────────
// Storage provider selection
// ──────────────────────────────────────────────────────────────────────────────
// Read from env var: StorageSettings__Provider=SqlServer (or "MongoDB")
// Default is "MongoDB" so that the service still works without any EF config.
var storageProvider = builder.Configuration["StorageSettings:Provider"] ?? "MongoDB";

// ──────────────────────────────────────────────────────────────────────────────
// Services Configuration
// ──────────────────────────────────────────────────────────────────────────────

// CORS — allow all origins (same policy as all Node.js services)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ── Storage: wire up the right IPaymentService implementation ─────────────────
if (storageProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
{
    // SQL Server path — requires ConnectionStrings__SqlServer env var
    var connectionString = builder.Configuration.GetConnectionString("SqlServer")
        ?? throw new InvalidOperationException(
            "SQL Server connection string is missing. " +
            "Set the ConnectionStrings__SqlServer environment variable.");

    // Register DbContext as Scoped (one instance per HTTP request)
    builder.Services.AddDbContext<PaymentDbContext>(options =>
        options.UseSqlServer(connectionString));

    // Repository: EF Core SQL Server implementation
    builder.Services.AddScoped<IPaymentRepository, SqlPaymentRepository>();

    // Service: SQL-backed, implements the same IPaymentService the controller uses
    builder.Services.AddScoped<IPaymentService, SqlPaymentService>();
}
else
{
    // MongoDB path — existing behaviour, zero changes to MongoPaymentService
    builder.Services.Configure<MongoDbSettings>(
        builder.Configuration.GetSection("MongoDbSettings"));
    builder.Services.AddSingleton<IPaymentService, MongoPaymentService>();
}

// PayPal service — shared by both storage paths (PayPal credentials don't change)
builder.Services.Configure<PayPalSettings>(
    builder.Configuration.GetSection("PayPalSettings"));
builder.Services.AddHttpClient<IPayPalService, PayPalService>();

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // camelCase JSON — matches the Node.js services' response format
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Payment Service (.NET Core)", Version = "v1" });
    // Include XML comments generated from /// doc comments (enabled in .csproj)
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

// ──────────────────────────────────────────────────────────────────────────────
// Auto-migrate: apply any pending EF Core migrations on startup.
// Scoped to Development only — in Production, run migrations as part of the
// deployment pipeline (e.g. dotnet ef database update in CI/CD).
// ──────────────────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment()
    && storageProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();

    // Retry loop — SQL Server in Docker can take 10-20 s to accept connections
    var retries = 6;
    while (retries > 0)
    {
        try
        {
            app.Logger.LogInformation("Applying EF Core migrations…");
            db.Database.Migrate();
            app.Logger.LogInformation("Migrations applied successfully.");
            break;
        }
        catch (Exception ex) when (retries > 1)
        {
            retries--;
            app.Logger.LogWarning(ex, "Migration attempt failed. Retrying in 5 s… ({Retries} left)", retries);
            Thread.Sleep(TimeSpan.FromSeconds(5));
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Middleware Pipeline
// ──────────────────────────────────────────────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseRouting();

app.MapControllers();

// Health check — shows which storage backend is active
app.MapGet("/", () =>
    $"Payment Service is running (.NET Core — storage: {storageProvider})");

app.Run();
