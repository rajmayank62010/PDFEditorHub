using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PDFEditorHub.Domain.Interfaces;

namespace PDFEditorHub.Infrastructure.FileProcessing;

/// <summary>
/// In-memory temporary file store. Files are never written to disk permanently.
/// All entries expire automatically after 30 minutes.
/// </summary>
public class TempFileStore : ITempFileStore
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<TempFileStore> _logger;
    private static readonly TimeSpan Expiry = TimeSpan.FromMinutes(30);

    private record CacheEntry(byte[] Data, string FileName, string ContentType, DateTime ExpiresAt);

    public TempFileStore(IMemoryCache cache, ILogger<TempFileStore> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public Task<string> StoreAsync(byte[] data, string fileName, string contentType, CancellationToken ct = default)
    {
        var id = Guid.NewGuid().ToString("N");
        var entry = new CacheEntry(data, fileName, contentType, DateTime.UtcNow.Add(Expiry));

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

    public Task<(byte[] Data, string FileName, string ContentType)?> RetrieveAsync(string id, CancellationToken ct = default)
    {
        if (_cache.TryGetValue<CacheEntry>(id, out var entry) && entry != null)
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
        // IMemoryCache handles expiry automatically
        _logger.LogDebug("Cleanup triggered — IMemoryCache handles expiry automatically");
        return Task.CompletedTask;
    }
}
