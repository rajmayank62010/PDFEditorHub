namespace PDFEditorHub.Domain.Entities;

/// <summary>
/// Represents a temporary file in memory/disk that will be cleaned up automatically.
/// No persistent storage — files are deleted after processing or download.
/// </summary>
public class TempFile
{
    public string Id { get; init; } = Guid.NewGuid().ToString("N");
    public string OriginalFileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = "application/pdf";
    public long FileSize { get; init; }
    public int PageCount { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; init; } = DateTime.UtcNow.AddMinutes(30);
    public string? TempPath { get; set; }
    public byte[]? Data { get; set; }

    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
}
