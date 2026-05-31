using PDFEditorHub.Application.DTOs;
using PDFEditorHub.Domain.Enums;
using PDFEditorHub.Domain.Interfaces;
using System.IO.Compression;
using DomainCompressionLevel = PDFEditorHub.Domain.Enums.CompressionLevel;

namespace PDFEditorHub.Application.Services;

public interface IPdfApplicationService
{
    Task<UploadResponseDto> HandleUploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
    Task<ProcessResponseDto> HandleMergeAsync(MergeRequestDto request, CancellationToken ct = default);
    Task<ProcessResponseDto> HandleSplitAsync(SplitRequestDto request, CancellationToken ct = default);
    Task<CompressResponseDto> HandleCompressAsync(CompressRequestDto request, CancellationToken ct = default);
    Task<ProcessResponseDto> HandleWatermarkAsync(WatermarkRequestDto request, CancellationToken ct = default);
    Task<ProcessResponseDto> HandleSignAsync(SignRequestDto request, CancellationToken ct = default);
    Task<ProcessResponseDto> HandleConvertAsync(ConvertRequestDto request, CancellationToken ct = default);
    Task<ProcessResponseDto> HandleEditAsync(EditRequestDto request, CancellationToken ct = default);
    Task<ProcessResponseDto> HandlePageManageAsync(PageManageRequestDto request, CancellationToken ct = default);
    Task<ProcessResponseDto> HandleSecurityAsync(SecurityRequestDto request, CancellationToken ct = default);
    Task<(byte[] Data, string FileName, string ContentType)?> GetDownloadAsync(string downloadId, CancellationToken ct = default);
    Task DeleteTempFileAsync(string fileId, CancellationToken ct = default);
}

public class PdfApplicationService : IPdfApplicationService
{
    private readonly ITempFileStore _store;
    private readonly IPdfMergeService _merge;
    private readonly IPdfSplitService _split;
    private readonly IPdfCompressService _compress;
    private readonly IPdfWatermarkService _watermark;
    private readonly IPdfSignService _sign;
    private readonly IPdfConvertService _convert;
    private readonly IPdfEditService _edit;
    private readonly IPdfPageService _page;
    private readonly IPdfSecurityService _security;

    public PdfApplicationService(
        ITempFileStore store,
        IPdfMergeService merge,
        IPdfSplitService split,
        IPdfCompressService compress,
        IPdfWatermarkService watermark,
        IPdfSignService sign,
        IPdfConvertService convert,
        IPdfEditService edit,
        IPdfPageService page,
        IPdfSecurityService security)
    {
        _store = store;
        _merge = merge;
        _split = split;
        _compress = compress;
        _watermark = watermark;
        _sign = sign;
        _convert = convert;
        _edit = edit;
        _page = page;
        _security = security;
    }

    // ─── Upload ───────────────────────────────────────────────────────────────
    public async Task<UploadResponseDto> HandleUploadAsync(
        Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        using var ms = new MemoryStream();
        await fileStream.CopyToAsync(ms, ct);
        var data = ms.ToArray();

        int pageCount = 0;
        if (contentType == "application/pdf")
            pageCount = await _page.GetPageCountAsync(data, ct);

        var fileId = await _store.StoreAsync(data, fileName, contentType, ct);

        return new UploadResponseDto(
            FileId: fileId,
            FileName: fileName,
            FileSize: data.Length,
            PageCount: pageCount,
            ExpiresAt: DateTime.UtcNow.AddMinutes(30).ToString("O"));
    }

    // ─── Merge ────────────────────────────────────────────────────────────────
    public async Task<ProcessResponseDto> HandleMergeAsync(
        MergeRequestDto request, CancellationToken ct = default)
    {
        var pdfDataList = new List<byte[]>();
        foreach (var id in request.FileIds)
        {
            var file = await _store.RetrieveAsync(id, ct)
                ?? throw new InvalidOperationException($"File '{id}' not found or has expired.");
            pdfDataList.Add(file.Data);
        }

        var merged = await _merge.MergeAsync(pdfDataList, ct);
        var outputName = SanitizeFileName(request.OutputFileName) ?? $"merged_{Stamp()}.pdf";
        var downloadId = await _store.StoreAsync(merged, outputName, "application/pdf", ct);
        return BuildProcessResponse(downloadId, outputName, merged.Length);
    }

    // ─── Split ────────────────────────────────────────────────────────────────
    public async Task<ProcessResponseDto> HandleSplitAsync(
        SplitRequestDto request, CancellationToken ct = default)
    {
        var file = await _store.RetrieveAsync(request.FileId, ct)
            ?? throw new InvalidOperationException("File not found or has expired.");

        var mode = request.SplitMode.ToLowerInvariant();
        byte[] result;
        string contentType = "application/pdf";
        string ext = "pdf";

        switch (mode)
        {
            case "byrange":
                result = await _split.SplitByRangeAsync(file.Data, request.PageRanges!, ct);
                break;

            case "allpages":
                // Return a ZIP archive containing one PDF per page
                var pages = await _split.SplitAllPagesAsync(file.Data, ct);
                result = PackToZip(pages, "pdf");
                contentType = "application/zip";
                ext = "zip";
                break;

            case "extractpages":
                result = await _split.ExtractPagesAsync(file.Data, request.Pages!, ct);
                break;

            default:
                throw new ArgumentException($"Unknown split mode: {request.SplitMode}");
        }

        var outputName = $"split_{Stamp()}.{ext}";
        var downloadId = await _store.StoreAsync(result, outputName, contentType, ct);
        return BuildProcessResponse(downloadId, outputName, result.Length);
    }

    // ─── Compress ─────────────────────────────────────────────────────────────
    public async Task<CompressResponseDto> HandleCompressAsync(
        CompressRequestDto request, CancellationToken ct = default)
    {
        var file = await _store.RetrieveAsync(request.FileId, ct)
            ?? throw new InvalidOperationException("File not found or has expired.");

        var level = Enum.Parse<DomainCompressionLevel>(request.CompressionLevel, ignoreCase: true);
        var compressed = await _compress.CompressAsync(file.Data, level, ct);

        var outputName = $"compressed_{Stamp()}.pdf";
        var downloadId = await _store.StoreAsync(compressed, outputName, "application/pdf", ct);

        var reduction = (int)Math.Round((1.0 - (double)compressed.Length / file.Data.Length) * 100);

        return new CompressResponseDto(
            DownloadId: downloadId,
            FileName: outputName,
            FileSize: compressed.Length,
            DownloadUrl: $"/api/pdf/download/{downloadId}",
            ExpiresAt: DateTime.UtcNow.AddMinutes(30).ToString("O"),
            OriginalSize: file.Data.Length,
            CompressedSize: compressed.Length,
            ReductionPercent: Math.Max(0, reduction));
    }

    // ─── Watermark ────────────────────────────────────────────────────────────
    public async Task<ProcessResponseDto> HandleWatermarkAsync(
        WatermarkRequestDto request, CancellationToken ct = default)
    {
        var file = await _store.RetrieveAsync(request.FileId, ct)
            ?? throw new InvalidOperationException("File not found or has expired.");

        var position = Enum.Parse<WatermarkPosition>(request.Position, ignoreCase: true);
        byte[] result;

        if (request.WatermarkType.Equals("text", StringComparison.OrdinalIgnoreCase))
        {
            result = await _watermark.AddTextWatermarkAsync(
                file.Data, request.Text!, request.FontSize,
                request.Opacity, request.Rotation, position, ct);
        }
        else
        {
            if (string.IsNullOrEmpty(request.ImageFileId))
                throw new ArgumentException("ImageFileId is required for image watermarks.");

            var imageFile = await _store.RetrieveAsync(request.ImageFileId, ct)
                ?? throw new InvalidOperationException("Watermark image file not found or has expired.");

            result = await _watermark.AddImageWatermarkAsync(
                file.Data, imageFile.Data, request.Opacity, position, request.Scale, ct);
        }

        var outputName = $"watermarked_{Stamp()}.pdf";
        var downloadId = await _store.StoreAsync(result, outputName, "application/pdf", ct);
        return BuildProcessResponse(downloadId, outputName, result.Length);
    }

    // ─── Sign ─────────────────────────────────────────────────────────────────
    public async Task<ProcessResponseDto> HandleSignAsync(
        SignRequestDto request, CancellationToken ct = default)
    {
        var file = await _store.RetrieveAsync(request.FileId, ct)
            ?? throw new InvalidOperationException("File not found or has expired.");

        byte[] result;

        if (request.SignatureType.Equals("type", StringComparison.OrdinalIgnoreCase))
        {
            result = await _sign.AddTypedSignatureAsync(
                file.Data, request.SignatureData,
                request.Page, request.X, request.Y, request.Width, request.Height, ct);
        }
        else
        {
            // "draw" or "upload" — both arrive as base64 data URI or raw base64
            var base64 = request.SignatureData.Contains(',')
                ? request.SignatureData.Split(',')[1]
                : request.SignatureData;

            if (string.IsNullOrWhiteSpace(base64))
                throw new ArgumentException("Signature image data is empty.");

            var sigBytes = Convert.FromBase64String(base64);
            result = await _sign.AddSignatureAsync(
                file.Data, sigBytes,
                request.Page, request.X, request.Y, request.Width, request.Height, ct);
        }

        var outputName = $"signed_{Stamp()}.pdf";
        var downloadId = await _store.StoreAsync(result, outputName, "application/pdf", ct);
        return BuildProcessResponse(downloadId, outputName, result.Length);
    }

    // ─── Convert ──────────────────────────────────────────────────────────────
    public async Task<ProcessResponseDto> HandleConvertAsync(
        ConvertRequestDto request, CancellationToken ct = default)
    {
        var file = await _store.RetrieveAsync(request.FileId, ct)
            ?? throw new InvalidOperationException("File not found or has expired.");

        var format = request.OutputFormat.ToLowerInvariant();
        byte[] result;
        string contentType;
        string ext;

        switch (format)
        {
            case "jpg":
            case "png":
                var convFmt = format == "jpg" ? ConversionFormat.Jpg : ConversionFormat.Png;
                var images = await _convert.PdfToImagesAsync(file.Data, convFmt, ct);
                var imageList = images.ToList();

                if (imageList.Count == 1)
                {
                    result = imageList[0];
                    contentType = format == "jpg" ? "image/jpeg" : "image/png";
                    ext = format;
                }
                else
                {
                    // Multiple pages → ZIP
                    result = PackToZip(imageList, format);
                    contentType = "application/zip";
                    ext = "zip";
                }
                break;

            case "txt":
                result = await _convert.PdfToTextAsync(file.Data, ct);
                contentType = "text/plain";
                ext = "txt";
                break;

            case "docx":
                result = await _convert.PdfToDocxAsync(file.Data, ct);
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                ext = "docx";
                break;

            case "pdf":
                // Source must be an image or DOCX — detect by content type
                if (file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                {
                    result = await _convert.ImagesToPdfAsync([file.Data], ct);
                }
                else
                {
                    result = await _convert.DocxToPdfAsync(file.Data, ct);
                }
                contentType = "application/pdf";
                ext = "pdf";
                break;

            default:
                throw new ArgumentException($"Unsupported output format: '{format}'.");
        }

        var outputName = $"converted_{Stamp()}.{ext}";
        var downloadId = await _store.StoreAsync(result, outputName, contentType, ct);
        return BuildProcessResponse(downloadId, outputName, result.Length);
    }

    // ─── Edit ─────────────────────────────────────────────────────────────────
    public async Task<ProcessResponseDto> HandleEditAsync(
        EditRequestDto request, CancellationToken ct = default)
    {
        var file = await _store.RetrieveAsync(request.FileId, ct)
            ?? throw new InvalidOperationException("File not found or has expired.");

        var annotations = request.Operations.Select(op => new PdfAnnotation(
            Type: Enum.Parse<EditOperationType>(op.Type, ignoreCase: true),
            Page: op.Page,
            X: op.X,
            Y: op.Y,
            Width: op.Width,
            Height: op.Height,
            Text: op.Text,
            FontSize: op.FontSize,
            Color: op.Color,
            Opacity: op.Opacity,
            Shape: op.ShapeType != null
                ? Enum.Parse<ShapeType>(op.ShapeType, ignoreCase: true)
                : null));

        var result = await _edit.ApplyAnnotationsAsync(file.Data, annotations, ct);
        var outputName = $"edited_{Stamp()}.pdf";
        var downloadId = await _store.StoreAsync(result, outputName, "application/pdf", ct);
        return BuildProcessResponse(downloadId, outputName, result.Length);
    }

    // ─── Page Management ──────────────────────────────────────────────────────
    public async Task<ProcessResponseDto> HandlePageManageAsync(
        PageManageRequestDto request, CancellationToken ct = default)
    {
        var file = await _store.RetrieveAsync(request.FileId, ct)
            ?? throw new InvalidOperationException("File not found or has expired.");

        var data = file.Data;

        foreach (var op in request.Operations)
        {
            ct.ThrowIfCancellationRequested();
            data = op.Type.ToLowerInvariant() switch
            {
                "rotate"    => await _page.RotatePageAsync(data, op.PageNumber, op.Rotation ?? 90, ct),
                "delete"    => await _page.DeletePageAsync(data, op.PageNumber, ct),
                "duplicate" => await _page.DuplicatePageAsync(data, op.PageNumber, ct),
                "reorder"   => op.NewPosition.HasValue
                                   ? await ReorderSinglePageAsync(data, op.PageNumber, op.NewPosition.Value, ct)
                                   : data,
                "extract"   => await _split.ExtractPagesAsync(data, [op.PageNumber], ct),
                _           => throw new ArgumentException($"Unknown page operation: '{op.Type}'.")
            };
        }

        var outputName = $"managed_{Stamp()}.pdf";
        var downloadId = await _store.StoreAsync(data, outputName, "application/pdf", ct);
        return BuildProcessResponse(downloadId, outputName, data.Length);
    }

    // ─── Security ─────────────────────────────────────────────────────────────
    public async Task<ProcessResponseDto> HandleSecurityAsync(
        SecurityRequestDto request, CancellationToken ct = default)
    {
        var file = await _store.RetrieveAsync(request.FileId, ct)
            ?? throw new InvalidOperationException("File not found or has expired.");

        byte[] result;
        var action = request.Action.ToLowerInvariant();

        switch (action)
        {
            case "addpassword":
                if (string.IsNullOrEmpty(request.Password))
                    throw new ArgumentException("Password is required.");
                result = await _security.AddPasswordAsync(
                    file.Data, request.Password, request.OwnerPassword, ct);
                break;

            case "removepassword":
                if (string.IsNullOrEmpty(request.Password))
                    throw new ArgumentException("Current password is required to remove protection.");
                result = await _security.RemovePasswordAsync(file.Data, request.Password, ct);
                break;

            default:
                throw new ArgumentException($"Unknown security action: '{request.Action}'.");
        }

        var outputName = $"secured_{Stamp()}.pdf";
        var downloadId = await _store.StoreAsync(result, outputName, "application/pdf", ct);
        return BuildProcessResponse(downloadId, outputName, result.Length);
    }

    // ─── Download ─────────────────────────────────────────────────────────────
    public Task<(byte[] Data, string FileName, string ContentType)?> GetDownloadAsync(
        string downloadId, CancellationToken ct = default)
        => _store.RetrieveAsync(downloadId, ct);

    // ─── Delete ───────────────────────────────────────────────────────────────
    public Task DeleteTempFileAsync(string fileId, CancellationToken ct = default)
        => _store.DeleteAsync(fileId, ct);

    // ─── Private helpers ──────────────────────────────────────────────────────

    private static ProcessResponseDto BuildProcessResponse(string downloadId, string fileName, long size) =>
        new(
            DownloadId: downloadId,
            FileName: fileName,
            FileSize: size,
            DownloadUrl: $"/api/pdf/download/{downloadId}",
            ExpiresAt: DateTime.UtcNow.AddMinutes(30).ToString("O"));

    private static string Stamp() => DateTime.UtcNow.ToString("yyyyMMddHHmmss");

    private static string? SanitizeFileName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name)) return null;
        var invalid = Path.GetInvalidFileNameChars();
        return new string(name.Where(c => !invalid.Contains(c)).ToArray());
    }

    private async Task<byte[]> ReorderSinglePageAsync(
        byte[] data, int fromPage, int toPage, CancellationToken ct)
    {
        int total = await _page.GetPageCountAsync(data, ct);
        var order = Enumerable.Range(1, total).ToList();
        if (fromPage < 1 || fromPage > total || toPage < 1 || toPage > total)
            return data;
        order.RemoveAt(fromPage - 1);
        order.Insert(toPage - 1, fromPage);
        return await _page.ReorderPagesAsync(data, order, ct);
    }

    /// <summary>Pack a collection of byte arrays into a ZIP archive.</summary>
    private static byte[] PackToZip(IEnumerable<byte[]> files, string extension)
    {
        using var zipStream = new MemoryStream();
        using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            int i = 1;
            foreach (var file in files)
            {
                var entry = archive.CreateEntry(
                    $"page_{i:D3}.{extension}",
                    System.IO.Compression.CompressionLevel.Fastest);
                using var entryStream = entry.Open();
                entryStream.Write(file, 0, file.Length);
                i++;
            }
        }
        return zipStream.ToArray();
    }
}
