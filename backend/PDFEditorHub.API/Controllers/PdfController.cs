using Microsoft.AspNetCore.Mvc;
using PDFEditorHub.Application.DTOs;
using PDFEditorHub.Application.Services;

namespace PDFEditorHub.API.Controllers;

[ApiController]
[Route("api/pdf")]
[Produces("application/json")]
public class PdfController : ControllerBase
{
    private readonly IPdfApplicationService _service;
    private readonly ILogger<PdfController> _logger;

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
    };

    // PDF magic bytes: %PDF
    private static readonly byte[] PdfMagic = [0x25, 0x50, 0x44, 0x46];

    public PdfController(IPdfApplicationService service, ILogger<PdfController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>Upload a file for processing. Returns a fileId used in subsequent operations.</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(52_428_800)]
    [ProducesResponseType(typeof(ApiResponse<UploadResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("No file provided."));

        if (file.Length > 52_428_800)
            return BadRequest(ApiResponse<object>.Fail("File size exceeds the 50 MB limit."));

        var contentType = file.ContentType.ToLowerInvariant();
        if (!AllowedMimeTypes.Contains(contentType))
            return BadRequest(ApiResponse<object>.Fail(
                $"File type '{file.ContentType}' is not supported. Accepted: PDF, JPG, PNG, DOCX."));

        // Validate PDF magic bytes
        if (contentType == "application/pdf")
        {
            await using var peek = file.OpenReadStream();
            var header = new byte[4];
            var read = await peek.ReadAsync(header, ct);
            if (read < 4 || !header.SequenceEqual(PdfMagic))
                return BadRequest(ApiResponse<object>.Fail("The uploaded file is not a valid PDF."));
        }

        _logger.LogInformation("Upload: {FileName} ({Size} bytes, {ContentType})",
            file.FileName, file.Length, file.ContentType);

        await using var stream = file.OpenReadStream();
        var result = await _service.HandleUploadAsync(stream, file.FileName, contentType, ct);
        return Ok(ApiResponse<UploadResponseDto>.Ok(result));
    }

    /// <summary>Apply text, shape, and annotation edits to a PDF.</summary>
    [HttpPost("edit")]
    [ProducesResponseType(typeof(ApiResponse<ProcessResponseDto>), 200)]
    public async Task<IActionResult> Edit([FromBody] EditRequestDto request, CancellationToken ct)
    {
        var result = await _service.HandleEditAsync(request, ct);
        return Ok(ApiResponse<ProcessResponseDto>.Ok(result));
    }

    /// <summary>Merge multiple PDF files into one document.</summary>
    [HttpPost("merge")]
    [ProducesResponseType(typeof(ApiResponse<ProcessResponseDto>), 200)]
    public async Task<IActionResult> Merge([FromBody] MergeRequestDto request, CancellationToken ct)
    {
        var result = await _service.HandleMergeAsync(request, ct);
        return Ok(ApiResponse<ProcessResponseDto>.Ok(result));
    }

    /// <summary>Split a PDF by page ranges, all pages, or extract specific pages.</summary>
    [HttpPost("split")]
    [ProducesResponseType(typeof(ApiResponse<ProcessResponseDto>), 200)]
    public async Task<IActionResult> Split([FromBody] SplitRequestDto request, CancellationToken ct)
    {
        var result = await _service.HandleSplitAsync(request, ct);
        return Ok(ApiResponse<ProcessResponseDto>.Ok(result));
    }

    /// <summary>Compress a PDF with low, medium, or high compression.</summary>
    [HttpPost("compress")]
    [ProducesResponseType(typeof(ApiResponse<CompressResponseDto>), 200)]
    public async Task<IActionResult> Compress([FromBody] CompressRequestDto request, CancellationToken ct)
    {
        var result = await _service.HandleCompressAsync(request, ct);
        return Ok(ApiResponse<CompressResponseDto>.Ok(result));
    }

    /// <summary>Add a text or image watermark to every page of a PDF.</summary>
    [HttpPost("watermark")]
    [ProducesResponseType(typeof(ApiResponse<ProcessResponseDto>), 200)]
    public async Task<IActionResult> Watermark([FromBody] WatermarkRequestDto request, CancellationToken ct)
    {
        var result = await _service.HandleWatermarkAsync(request, ct);
        return Ok(ApiResponse<ProcessResponseDto>.Ok(result));
    }

    /// <summary>Add a drawn, typed, or uploaded signature to a PDF page.</summary>
    [HttpPost("sign")]
    [ProducesResponseType(typeof(ApiResponse<ProcessResponseDto>), 200)]
    public async Task<IActionResult> Sign([FromBody] SignRequestDto request, CancellationToken ct)
    {
        var result = await _service.HandleSignAsync(request, ct);
        return Ok(ApiResponse<ProcessResponseDto>.Ok(result));
    }

    /// <summary>Convert a PDF to JPG/PNG/TXT/DOCX, or convert an image/DOCX to PDF.</summary>
    [HttpPost("convert")]
    [ProducesResponseType(typeof(ApiResponse<ProcessResponseDto>), 200)]
    public async Task<IActionResult> Convert([FromBody] ConvertRequestDto request, CancellationToken ct)
    {
        var result = await _service.HandleConvertAsync(request, ct);
        return Ok(ApiResponse<ProcessResponseDto>.Ok(result));
    }

    /// <summary>Rotate, delete, duplicate, or reorder pages in a PDF.</summary>
    [HttpPost("manage-pages")]
    [ProducesResponseType(typeof(ApiResponse<ProcessResponseDto>), 200)]
    public async Task<IActionResult> ManagePages([FromBody] PageManageRequestDto request, CancellationToken ct)
    {
        var result = await _service.HandlePageManageAsync(request, ct);
        return Ok(ApiResponse<ProcessResponseDto>.Ok(result));
    }

    /// <summary>Add or remove password protection on a PDF.</summary>
    [HttpPost("security")]
    [ProducesResponseType(typeof(ApiResponse<ProcessResponseDto>), 200)]
    public async Task<IActionResult> Security([FromBody] SecurityRequestDto request, CancellationToken ct)
    {
        var result = await _service.HandleSecurityAsync(request, ct);
        return Ok(ApiResponse<ProcessResponseDto>.Ok(result));
    }

    /// <summary>Download a processed file by its download ID. File is deleted after download.</summary>
    [HttpGet("download/{id}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<IActionResult> Download(string id, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length > 64)
            return BadRequest(ApiResponse<object>.Fail("Invalid download ID."));

        var file = await _service.GetDownloadAsync(id, ct);
        if (file is null)
            return NotFound(ApiResponse<object>.Fail("File not found or has expired."));

        var (data, fileName, contentType) = file.Value;

        _logger.LogInformation("Download: {FileName} ({Size} bytes)", fileName, data.Length);

        // Delete after download — privacy-first, fire-and-forget
        _ = Task.Run(() => _service.DeleteTempFileAsync(id, CancellationToken.None));

        Response.Headers["Content-Disposition"] = $"attachment; filename=\"{fileName}\"";
        Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
        Response.Headers["Pragma"] = "no-cache";
        Response.Headers["Expires"] = "0";

        return File(data, contentType, fileName);
    }

    /// <summary>Explicitly delete a temporary file before it expires.</summary>
    [HttpDelete("delete-temp/{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> DeleteTemp(string id, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length > 64)
            return BadRequest(ApiResponse<object>.Fail("Invalid file ID."));

        await _service.DeleteTempFileAsync(id, ct);
        return Ok(ApiResponse<object?>.Ok(null, "File deleted successfully."));
    }
}
