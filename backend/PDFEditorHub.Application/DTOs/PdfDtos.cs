using PDFEditorHub.Domain.Enums;

namespace PDFEditorHub.Application.DTOs;

// ─── Upload ───────────────────────────────────────────────────────────────────

public record UploadResponseDto(
    string FileId,
    string FileName,
    long FileSize,
    int PageCount,
    string ExpiresAt
);

// ─── Process Result ───────────────────────────────────────────────────────────

public record ProcessResponseDto(
    string DownloadId,
    string FileName,
    long FileSize,
    string DownloadUrl,
    string ExpiresAt
);

public record CompressResponseDto(
    string DownloadId,
    string FileName,
    long FileSize,
    string DownloadUrl,
    string ExpiresAt,
    long OriginalSize,
    long CompressedSize,
    int ReductionPercent
) : ProcessResponseDto(DownloadId, FileName, FileSize, DownloadUrl, ExpiresAt);

// ─── Merge ────────────────────────────────────────────────────────────────────

public record MergeRequestDto(
    List<string> FileIds,
    string? OutputFileName = null
);

// ─── Split ────────────────────────────────────────────────────────────────────

public record SplitRequestDto(
    string FileId,
    string SplitMode,
    string? PageRanges = null,
    List<int>? Pages = null
);

// ─── Compress ─────────────────────────────────────────────────────────────────

public record CompressRequestDto(
    string FileId,
    string CompressionLevel
);

// ─── Watermark ────────────────────────────────────────────────────────────────

public record WatermarkRequestDto(
    string FileId,
    string WatermarkType,
    string? Text = null,
    int FontSize = 48,
    float Opacity = 0.3f,
    float Rotation = 45f,
    string Position = "center",
    string? ImageFileId = null,
    float Scale = 1.0f
);

// ─── Sign ─────────────────────────────────────────────────────────────────────

public record SignRequestDto(
    string FileId,
    string SignatureType,
    string SignatureData,
    int Page,
    float X,
    float Y,
    float Width,
    float Height
);

// ─── Convert ──────────────────────────────────────────────────────────────────

public record ConvertRequestDto(
    string FileId,
    string OutputFormat
);

// ─── Edit ─────────────────────────────────────────────────────────────────────

public record EditRequestDto(
    string FileId,
    List<EditOperationDto> Operations
);

public record EditOperationDto(
    string Type,
    int Page,
    float X,
    float Y,
    float Width = 100,
    float Height = 30,
    string? Text = null,
    int FontSize = 14,
    string Color = "#000000",
    float Opacity = 1.0f,
    string? ShapeType = null
);

// ─── Page Management ──────────────────────────────────────────────────────────

public record PageManageRequestDto(
    string FileId,
    List<PageOperationDto> Operations
);

public record PageOperationDto(
    string Type,
    int PageNumber,
    int? Rotation = null,
    int? NewPosition = null
);

// ─── Security ─────────────────────────────────────────────────────────────────

public record SecurityRequestDto(
    string FileId,
    string Action,
    string? Password = null,
    string? OwnerPassword = null,
    PdfPermissionsDto? Permissions = null
);

public record PdfPermissionsDto(
    bool AllowPrinting = true,
    bool AllowCopying = false,
    bool AllowEditing = false,
    bool AllowAnnotating = false
);

// ─── API Wrapper ──────────────────────────────────────────────────────────────

public record ApiResponse<T>(
    bool Success,
    T? Data,
    string? Message = null,
    List<string>? Errors = null
)
{
    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new(true, data, message);

    public static ApiResponse<T> Fail(string message, List<string>? errors = null) =>
        new(false, default, message, errors);
}
