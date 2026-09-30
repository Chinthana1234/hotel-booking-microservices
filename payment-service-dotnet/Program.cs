using PaymentService.Models;
using PaymentService.Services;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────
// Services Configuration
// ──────────────────────────────────────────

// Bind MongoDB settings from appsettings.json
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// CORS — allow all origins (same as Node.js app.use(cors()))
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register Payment Service (MongoDB-backed)
builder.Services.AddSingleton<IPaymentService, MongoPaymentService>();

// Register PayPal Service
builder.Services.Configure<PayPalSettings>(
    builder.Configuration.GetSection("PayPalSettings"));
builder.Services.AddHttpClient<IPayPalService, PayPalService>();

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Use camelCase JSON (matches Node.js response format)
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Payment Service (.NET Core)", Version = "v1" });
});

var app = builder.Build();

// ──────────────────────────────────────────
// Middleware Pipeline
// ──────────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseRouting();

app.MapControllers();

// Base route — health check
app.MapGet("/", () => "Payment Service is running (.NET Core + MongoDB)");

app.Run();
