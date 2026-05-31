using iText.Kernel.Pdf;
using iText.Kernel.Utils;
using PDFEditorHub.Domain.Interfaces;

namespace PDFEditorHub.Infrastructure.PdfServices;

public class PdfMergeService : IPdfMergeService
{
    public async Task<byte[]> MergeAsync(IEnumerable<byte[]> pdfFiles, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var outputStream = new MemoryStream();
            using var writer = new PdfWriter(outputStream);
            using var outputDoc = new PdfDocument(writer);
            var merger = new PdfMerger(outputDoc);

            foreach (var pdfData in pdfFiles)
            {
                ct.ThrowIfCancellationRequested();
                using var inputStream = new MemoryStream(pdfData);
                using var reader = new PdfReader(inputStream);
                using var inputDoc = new PdfDocument(reader);
                merger.Merge(inputDoc, 1, inputDoc.GetNumberOfPages());
            }

            outputDoc.Close();
            return outputStream.ToArray();
        }, ct);
    }
}
