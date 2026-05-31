using PDFEditorHub.Domain.Enums;

namespace PDFEditorHub.Domain.Interfaces;

public interface IPdfMergeService
{
    Task<byte[]> MergeAsync(IEnumerable<byte[]> pdfFiles, CancellationToken ct = default);
}

public interface IPdfSplitService
{
    Task<byte[]> SplitByRangeAsync(byte[] pdfData, string pageRanges, CancellationToken ct = default);
    Task<IEnumerable<byte[]>> SplitAllPagesAsync(byte[] pdfData, CancellationToken ct = default);
    Task<byte[]> ExtractPagesAsync(byte[] pdfData, IEnumerable<int> pages, CancellationToken ct = default);
}

public interface IPdfCompressService
{
    Task<byte[]> CompressAsync(byte[] pdfData, CompressionLevel level, CancellationToken ct = default);
    long EstimateCompressedSize(long originalSize, CompressionLevel level);
}

public interface IPdfWatermarkService
{
    Task<byte[]> AddTextWatermarkAsync(byte[] pdfData, string text, int fontSize, float opacity,
        float rotation, WatermarkPosition position, CancellationToken ct = default);
    Task<byte[]> AddImageWatermarkAsync(byte[] pdfData, byte[] imageData, float opacity,
        WatermarkPosition position, float scale, CancellationToken ct = default);
}

public interface IPdfSignService
{
    Task<byte[]> AddSignatureAsync(byte[] pdfData, byte[] signatureImageData, int page,
        float x, float y, float width, float height, CancellationToken ct = default);
    Task<byte[]> AddTypedSignatureAsync(byte[] pdfData, string text, int page,
        float x, float y, float width, float height, CancellationToken ct = default);
}

public interface IPdfConvertService
{
    Task<IEnumerable<byte[]>> PdfToImagesAsync(byte[] pdfData, ConversionFormat format, CancellationToken ct = default);
    Task<byte[]> ImagesToPdfAsync(IEnumerable<byte[]> images, CancellationToken ct = default);
    Task<byte[]> PdfToTextAsync(byte[] pdfData, CancellationToken ct = default);
    Task<byte[]> PdfToDocxAsync(byte[] pdfData, CancellationToken ct = default);
    Task<byte[]> DocxToPdfAsync(byte[] docxData, CancellationToken ct = default);
}

public interface IPdfEditService
{
    Task<byte[]> ApplyAnnotationsAsync(byte[] pdfData, IEnumerable<PdfAnnotation> annotations, CancellationToken ct = default);
}

public interface IPdfPageService
{
    Task<byte[]> RotatePageAsync(byte[] pdfData, int pageNumber, int degrees, CancellationToken ct = default);
    Task<byte[]> DeletePageAsync(byte[] pdfData, int pageNumber, CancellationToken ct = default);
    Task<byte[]> DuplicatePageAsync(byte[] pdfData, int pageNumber, CancellationToken ct = default);
    Task<byte[]> ReorderPagesAsync(byte[] pdfData, IEnumerable<int> newOrder, CancellationToken ct = default);
    Task<int> GetPageCountAsync(byte[] pdfData, CancellationToken ct = default);
}

public interface IPdfSecurityService
{
    Task<byte[]> AddPasswordAsync(byte[] pdfData, string userPassword, string? ownerPassword, CancellationToken ct = default);
    Task<byte[]> RemovePasswordAsync(byte[] pdfData, string password, CancellationToken ct = default);
}

public interface ITempFileStore
{
    Task<string> StoreAsync(byte[] data, string fileName, string contentType, CancellationToken ct = default);
    Task<(byte[] Data, string FileName, string ContentType)?> RetrieveAsync(string id, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
    Task CleanupExpiredAsync(CancellationToken ct = default);
}

public record PdfAnnotation(
    EditOperationType Type,
    int Page,
    float X,
    float Y,
    float Width,
    float Height,
    string? Text,
    int FontSize,
    string Color,
    float Opacity,
    ShapeType? Shape
);
