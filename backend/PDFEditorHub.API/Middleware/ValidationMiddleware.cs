using FluentValidation;
using PDFEditorHub.Application.DTOs;

namespace PDFEditorHub.API.Middleware;

public class ValidationExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ValidationExceptionMiddleware> _logger;

    public ValidationExceptionMiddleware(RequestDelegate next, ILogger<ValidationExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation failed: {Errors}", string.Join(", ", ex.Errors.Select(e => e.ErrorMessage)));
            context.Response.StatusCode = 400;
            context.Response.ContentType = "application/json";
            var errors = ex.Errors.Select(e => e.ErrorMessage).ToList();
            await context.Response.WriteAsJsonAsync(
                ApiResponse<object>.Fail("Validation failed.", errors));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Operation failed: {Message}", ex.Message);
            context.Response.StatusCode = 400;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(
                ApiResponse<object>.Fail(ex.Message));
        }
        catch (ArgumentException ex)
        {
            context.Response.StatusCode = 400;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(
                ApiResponse<object>.Fail(ex.Message));
        }
    }
}

public static class ValidationMiddlewareExtensions
{
    public static IApplicationBuilder UseValidationExceptionHandling(this IApplicationBuilder app)
        => app.UseMiddleware<ValidationExceptionMiddleware>();
}
