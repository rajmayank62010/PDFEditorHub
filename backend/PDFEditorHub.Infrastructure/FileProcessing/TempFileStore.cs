using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PDFEditorHub.Domain.Interfaces;

namespace PDFEditorHub.Infrastructure.FileProcessing;

/// <summary>
/// In-memory temporary file store with its own dedicated MemoryCache.
/// Files are never written to disk permanently.
/// All entries expire automatically after 30 minutes.
/// Uses a private cache instance to avoid conflicts with other caches (e.g. rate limiter).
/// </summary>
public class TempFileStore : ITempFileStore, IDisposable
{
    // Private dedicated cache — NOT injected from DI, so no SizeLimit conflict
    private readonly IMemoryCache _cache;
    private readonly ILogger<TempFileStore> _logger;
    private static readonly TimeSpan Expiry = TimeSpan.FromMinutes(30);
    private bool _disposed;

    private record CacheEntry(byte[] Data, string FileName, string ContentType);

    public TempFileStore(ILogger<TempFileStore> logger)
    {
        _logger = logger;

        // Create a dedicated cache with a 500 MB size limit
        _cache = new MemoryCache(new MemoryCacheOptions
        {
            SizeLimit = 500 * 1024 * 1024 // 500 MB
        });
    }

    public Task<string> StoreAsync(
        byte[] data,
        string fileName,
        string contentType,
        CancellationToken ct = default)
    {
        var id = Guid.NewGuid().ToString("N");
        var entry = new CacheEntry(data, fileName, contentType);

        var options = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(Expiry)
            .SetSize(data.Length)
            .RegisterPostEvictionCallback((key, _, reason, _) =>
            {
                _logger.LogDebug("Temp file {Key} evicted: {Reason}", key, reason);
            });

        _cache.Set(id, entry, options);
        _logger.LogDebug("Stored temp file {Id} ({FileName}, {Size} bytes)", id, fileName, data.Length);
        return Task.FromResult(id);
    }

    public Task<(byte[] Data, string FileName, string ContentType)?> RetrieveAsync(
        string id,
        CancellationToken ct = default)
    {
        if (_cache.TryGetValue<CacheEntry>(id, out var entry) && entry is not null)
        {
            return Task.FromResult<(byte[], string, string)?>((entry.Data, entry.FileName, entry.ContentType));
        }
        return Task.FromResult<(byte[], string, string)?>(null);
    }

    public Task DeleteAsync(string id, CancellationToken ct = default)
    {
        _cache.Remove(id);
        _logger.LogDebug("Deleted temp file {Id}", id);
        return Task.CompletedTask;
    }

    public Task CleanupExpiredAsync(CancellationToken ct = default)
    {
        // MemoryCache handles expiry automatically via SetAbsoluteExpiration
        _logger.LogDebug("Cleanup sweep — MemoryCache handles expiry automatically");
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _cache.Dispose();
            _disposed = true;
        }
    }
}
