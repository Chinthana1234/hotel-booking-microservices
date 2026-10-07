using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using PaymentService.Data;
using PaymentService.Data.Repositories;
using PaymentService.Models;
using PaymentService.Services;
using MassTransit;
using PaymentService.Consumers;

var builder = WebApplication.CreateBuilder(args);

var jwtSecret = builder.Configuration["JWT_SECRET"] ?? "supersecretkey12345678901234567890";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireAssertion(context => 
        context.User.HasClaim(c => c.Type == "isAdmin" && c.Value.Equals("true", StringComparison.OrdinalIgnoreCase))));
});

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

// ──────────────────────────────────────────────────────────────────────────────
// MassTransit (RabbitMQ) Configuration
// ──────────────────────────────────────────────────────────────────────────────
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<BookingConfirmedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitHost = builder.Configuration["RabbitMQ:Host"] ?? "localhost";
        cfg.Host(rabbitHost, "/", h => {
            h.Username("guest");
            h.Password("guest");
        });

        // The exact exchange routing key depends on how the publisher formats the urn.
        // But for explicit queues:
        cfg.ReceiveEndpoint("PaymentService.Events:BookingConfirmed", e =>
        {
            // Configure retries
            e.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(5)));
            e.ConfigureConsumer<BookingConfirmedConsumer>(context);
        });
    });
});

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // camelCase JSON — matches the Node.js services' response format
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Health Checks
builder.Services.AddHealthChecks();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Payment Service (.NET Core)", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\""
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map Health Check Endpoint
app.MapHealthChecks("/health");

// Health check — shows which storage backend is active
app.MapGet("/", () =>
    $"Payment Service is running (.NET Core — storage: {storageProvider})");

app.Run();

// Make the Program class public so test projects can access it
public partial class Program { }
