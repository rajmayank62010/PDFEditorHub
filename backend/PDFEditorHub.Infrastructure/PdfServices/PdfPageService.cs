using iText.Kernel.Pdf;
using iText.Kernel.Utils;
using PDFEditorHub.Domain.Interfaces;

namespace PDFEditorHub.Infrastructure.PdfServices;

public class PdfPageService : IPdfPageService
{
    public async Task<byte[]> RotatePageAsync(byte[] pdfData, int pageNumber, int degrees, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream);
            using var doc = new PdfDocument(reader, writer);

            var page = doc.GetPage(pageNumber);
            int currentRotation = page.GetRotation();
            page.SetRotation((currentRotation + degrees) % 360);

            doc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    public async Task<byte[]> DeletePageAsync(byte[] pdfData, int pageNumber, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream);
            using var doc = new PdfDocument(reader, writer);

            if (doc.GetNumberOfPages() <= 1)
                throw new InvalidOperationException("Cannot delete the only page in a document.");

            doc.RemovePage(pageNumber);
            doc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    public async Task<byte[]> DuplicatePageAsync(byte[] pdfData, int pageNumber, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream);
            using var doc = new PdfDocument(reader, writer);

            var page = doc.GetPage(pageNumber);
            var copy = page.CopyTo(doc);
            doc.AddPage(pageNumber + 1, copy);

            doc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    public async Task<byte[]> ReorderPagesAsync(byte[] pdfData, IEnumerable<int> newOrder, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            var orderList = newOrder.ToList();
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            using var writer = new PdfWriter(outputStream);
            using var outputDoc = new PdfDocument(writer);
            using var reader = new PdfReader(inputStream);
            using var inputDoc = new PdfDocument(reader);

            var merger = new PdfMerger(outputDoc);
            foreach (var pageNum in orderList)
            {
                ct.ThrowIfCancellationRequested();
                merger.Merge(inputDoc, pageNum, pageNum);
            }

            outputDoc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    public async Task<int> GetPageCountAsync(byte[] pdfData, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            try
            {
                using var inputStream = new MemoryStream(pdfData);
                using var reader = new PdfReader(inputStream);
                using var doc = new PdfDocument(reader);
                return doc.GetNumberOfPages();
            }
            catch
            {
                return 0;
            }
        }, ct);
    }
}
