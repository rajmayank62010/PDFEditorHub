using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PDFEditorHub.Domain.Interfaces;

namespace PDFEditorHub.Infrastructure.Cleanup;

/// <summary>
/// Background service that periodically triggers cleanup of expired temp files.
/// The IMemoryCache handles expiry automatically, but this provides an explicit sweep.
/// </summary>
public class TempFileCleanupService : BackgroundService
{
    private readonly ITempFileStore _store;
    private readonly ILogger<TempFileCleanupService> _logger;
    private static readonly TimeSpan CleanupInterval = TimeSpan.FromMinutes(15);

    public TempFileCleanupService(ITempFileStore store, ILogger<TempFileCleanupService> logger)
    {
        _store = store;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Temp file cleanup service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await _store.CleanupExpiredAsync(stoppingToken);
                _logger.LogDebug("Temp file cleanup completed at {Time}", DateTime.UtcNow);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Error during temp file cleanup");
            }

            await Task.Delay(CleanupInterval, stoppingToken);
        }

        _logger.LogInformation("Temp file cleanup service stopped.");
    }
}
