using iText.Kernel.Pdf;
using PDFEditorHub.Domain.Interfaces;
using DomainCompressionLevel = PDFEditorHub.Domain.Enums.CompressionLevel;

namespace PDFEditorHub.Infrastructure.PdfServices;

public class PdfCompressService : IPdfCompressService
{
    public async Task<byte[]> CompressAsync(
        byte[] pdfData,
        DomainCompressionLevel level,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();

            // iText 8 uses integer constants 0-9 for compression level
            int compressionLevel = level switch
            {
                DomainCompressionLevel.Low    => 1,
                DomainCompressionLevel.Medium => 6,
                DomainCompressionLevel.High   => 9,
                _                             => 6
            };

            var writerProps = new WriterProperties()
                .SetCompressionLevel(compressionLevel);

            if (level == DomainCompressionLevel.High)
                writerProps.UseSmartMode();

            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream, writerProps);
            using var doc = new PdfDocument(reader, writer);
            doc.SetFlushUnusedObjects(true);
            doc.Close();

            return outputStream.ToArray();
        }, ct);
    }

    public long EstimateCompressedSize(long originalSize, DomainCompressionLevel level) =>
        level switch
        {
            DomainCompressionLevel.Low    => (long)(originalSize * 0.75),
            DomainCompressionLevel.Medium => (long)(originalSize * 0.50),
            DomainCompressionLevel.High   => (long)(originalSize * 0.30),
            _                             => originalSize
        };
}
