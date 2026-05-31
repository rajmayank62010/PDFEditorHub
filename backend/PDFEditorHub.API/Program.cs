using AspNetCoreRateLimit;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.OpenApi.Models;
using PDFEditorHub.API.Filters;
using PDFEditorHub.API.Middleware;
using PDFEditorHub.Application.Services;
using PDFEditorHub.Application.Validators;
using PDFEditorHub.Domain.Interfaces;
using PDFEditorHub.Infrastructure.Cleanup;
using PDFEditorHub.Infrastructure.FileProcessing;
using PDFEditorHub.Infrastructure.PdfServices;

var builder = WebApplication.CreateBuilder(args);

// ─── Controllers + Filters ────────────────────────────────────────────────────
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidateModelFilter>();
});
builder.Services.AddEndpointsApiExplorer();

// ─── Swagger ──────────────────────────────────────────────────────────────────
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PDFEditorHub API",
        Version = "v1",
        Description = "Privacy-first PDF processing API. Files are processed in memory and never permanently stored.",
        Contact = new OpenApiContact { Name = "PDFEditorHub", Email = "api@pdfeditorhub.com" }
    });
});

// ─── Memory Cache (single registration with size limit) ───────────────────────
// IMPORTANT: Only one AddMemoryCache call. SizeLimit is required for TempFileStore.SetSize() to work.
builder.Services.AddMemoryCache(options =>
{
    options.SizeLimit = 500 * 1024 * 1024; // 500 MB
});

// ─── FluentValidation ─────────────────────────────────────────────────────────
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<MergeRequestValidator>();

// ─── Rate Limiting ────────────────────────────────────────────────────────────
builder.Services.AddOptions();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
builder.Services.AddInMemoryRateLimiting();

// ─── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                      ?? ["http://localhost:3000", "https://pdfeditorhub.com"];
        policy.WithOrigins(origins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("Content-Disposition");
    });
});

// ─── Domain / Infrastructure Services ────────────────────────────────────────
builder.Services.AddScoped<ITempFileStore, TempFileStore>();
builder.Services.AddScoped<IPdfMergeService, PdfMergeService>();
builder.Services.AddScoped<IPdfSplitService, PdfSplitService>();
builder.Services.AddScoped<IPdfCompressService, PdfCompressService>();
builder.Services.AddScoped<IPdfWatermarkService, PdfWatermarkService>();
builder.Services.AddScoped<IPdfSignService, PdfSignService>();
builder.Services.AddScoped<IPdfConvertService, PdfConvertService>();
builder.Services.AddScoped<IPdfEditService, PdfEditService>();
builder.Services.AddScoped<IPdfPageService, PdfPageService>();
builder.Services.AddScoped<IPdfSecurityService, PdfSecurityService>();

// ─── Application Service ──────────────────────────────────────────────────────
builder.Services.AddScoped<IPdfApplicationService, PdfApplicationService>();

// ─── Background Cleanup ───────────────────────────────────────────────────────
builder.Services.AddHostedService<TempFileCleanupService>();

// ─── Request Size Limits (50 MB) ──────────────────────────────────────────────
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52_428_800;
});
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 52_428_800;
});

// ─── Logging ──────────────────────────────────────────────────────────────────
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// ─── Middleware Pipeline ───────────────────────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PDFEditorHub API v1");
        c.RoutePrefix = "swagger";
    });
}

// Global exception handler (must be first)
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (error != null)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(error.Error, "Unhandled exception");
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                message = app.Environment.IsDevelopment()
                    ? error.Error.Message
                    : "An internal error occurred. Please try again.",
                errors = app.Environment.IsDevelopment()
                    ? new[] { error.Error.StackTrace }
                    : null
            });
        }
    });
});

// Validation exception middleware (converts FluentValidation/domain exceptions to 400)
app.UseValidationExceptionHandling();

// Rate limiting
app.UseIpRateLimiting();

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    await next();
});

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
