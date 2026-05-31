using iText.Kernel.Pdf;
using iText.Kernel.Utils;
using PDFEditorHub.Domain.Interfaces;

namespace PDFEditorHub.Infrastructure.PdfServices;

public class PdfSplitService : IPdfSplitService
{
    public async Task<byte[]> SplitByRangeAsync(byte[] pdfData, string pageRanges, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            var pages = ParsePageRanges(pageRanges);
            return ExtractPagesInternal(pdfData, pages);
        }, ct);
    }

    public async Task<IEnumerable<byte[]>> SplitAllPagesAsync(byte[] pdfData, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            var results = new List<byte[]>();
            using var inputStream = new MemoryStream(pdfData);
            using var reader = new PdfReader(inputStream);
            using var inputDoc = new PdfDocument(reader);
            int total = inputDoc.GetNumberOfPages();

            for (int i = 1; i <= total; i++)
            {
                ct.ThrowIfCancellationRequested();
                results.Add(ExtractPagesInternal(pdfData, [i]));
            }
            return (IEnumerable<byte[]>)results;
        }, ct);
    }

    public async Task<byte[]> ExtractPagesAsync(byte[] pdfData, IEnumerable<int> pages, CancellationToken ct = default)
    {
        return await Task.Run(() => ExtractPagesInternal(pdfData, pages.ToList()), ct);
    }

    private static byte[] ExtractPagesInternal(byte[] pdfData, List<int> pages)
    {
        using var outputStream = new MemoryStream();
        using var writer = new PdfWriter(outputStream);
        using var outputDoc = new PdfDocument(writer);
        using var inputStream = new MemoryStream(pdfData);
        using var reader = new PdfReader(inputStream);
        using var inputDoc = new PdfDocument(reader);

        var merger = new PdfMerger(outputDoc);
        foreach (var page in pages.OrderBy(p => p))
        {
            if (page >= 1 && page <= inputDoc.GetNumberOfPages())
            {
                merger.Merge(inputDoc, page, page);
            }
        }

        outputDoc.Close();
        return outputStream.ToArray();
    }

    private static List<int> ParsePageRanges(string ranges)
    {
        var pages = new HashSet<int>();
        foreach (var part in ranges.Split(',', StringSplitOptions.RemoveEmptyEntries))
        {
            var trimmed = part.Trim();
            if (trimmed.Contains('-'))
            {
                var bounds = trimmed.Split('-');
                if (int.TryParse(bounds[0].Trim(), out int start) &&
                    int.TryParse(bounds[1].Trim(), out int end))
                {
                    for (int i = start; i <= end; i++) pages.Add(i);
                }
            }
            else if (int.TryParse(trimmed, out int page))
            {
                pages.Add(page);
            }
        }
        return [.. pages.OrderBy(p => p)];
    }
}
