using iText.IO.Image;
using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using PDFEditorHub.Domain.Interfaces;

namespace PDFEditorHub.Infrastructure.PdfServices;

public class PdfSignService : IPdfSignService
{
    public async Task<byte[]> AddSignatureAsync(byte[] pdfData, byte[] signatureImageData, int page,
        float x, float y, float width, float height, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream);
            using var doc = new PdfDocument(reader, writer);

            if (page < 1 || page > doc.GetNumberOfPages())
                throw new ArgumentException($"Page {page} does not exist in the document.");

            var pdfPage = doc.GetPage(page);
            var canvas = new PdfCanvas(pdfPage);

            var imgData = ImageDataFactory.Create(signatureImageData);
            canvas.AddImageFittedIntoRectangle(imgData,
                new iText.Kernel.Geom.Rectangle(x, y, width, height), false);
            canvas.Release();

            doc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    public async Task<byte[]> AddTypedSignatureAsync(byte[] pdfData, string text, int page,
        float x, float y, float width, float height, CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream);
            using var doc = new PdfDocument(reader, writer);

            if (page < 1 || page > doc.GetNumberOfPages())
                throw new ArgumentException($"Page {page} does not exist in the document.");

            var pdfPage = doc.GetPage(page);
            var canvas = new PdfCanvas(pdfPage);
            var font = PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA_OBLIQUE);

            canvas.BeginText()
                .SetFontAndSize(font, 24)
                .MoveText(x, y)
                .ShowText(text)
                .EndText();

            canvas.Release();
            doc.Close();
            return outputStream.ToArray();
        }, ct);
    }
}
