using iText.IO.Image;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Kernel.Pdf.Extgstate;
using PDFEditorHub.Domain.Enums;
using PDFEditorHub.Domain.Interfaces;

namespace PDFEditorHub.Infrastructure.PdfServices;

public class PdfWatermarkService : IPdfWatermarkService
{
    public async Task<byte[]> AddTextWatermarkAsync(
        byte[] pdfData,
        string text,
        int fontSize,
        float opacity,
        float rotation,
        WatermarkPosition position,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream);
            using var doc = new PdfDocument(reader, writer);

            var font = PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA_BOLD);
            int pageCount = doc.GetNumberOfPages();

            for (int i = 1; i <= pageCount; i++)
            {
                ct.ThrowIfCancellationRequested();
                var page = doc.GetPage(i);
                var pageSize = page.GetPageSize();
                var canvas = new PdfCanvas(page.NewContentStreamBefore(), page.GetResources(), doc);

                var (x, y) = GetPosition(pageSize, position);

                canvas.SaveState();

                var gs = new PdfExtGState();
                gs.SetFillOpacity(opacity);
                gs.SetStrokeOpacity(opacity);
                canvas.SetExtGState(gs);

                double rad = rotation * Math.PI / 180.0;
                float cos = (float)Math.Cos(rad);
                float sin = (float)Math.Sin(rad);

                canvas.BeginText()
                      .SetFontAndSize(font, fontSize)
                      .SetFillColor(new DeviceRgb(128, 128, 128))
                      .SetTextMatrix(cos, sin, -sin, cos, x, y)
                      .ShowText(text)
                      .EndText();

                canvas.RestoreState();
                canvas.Release();
            }

            doc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    public async Task<byte[]> AddImageWatermarkAsync(
        byte[] pdfData,
        byte[] imageData,
        float opacity,
        WatermarkPosition position,
        float scale,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream);
            using var doc = new PdfDocument(reader, writer);

            var imgData = ImageDataFactory.Create(imageData);
            int pageCount = doc.GetNumberOfPages();

            for (int i = 1; i <= pageCount; i++)
            {
                ct.ThrowIfCancellationRequested();
                var page = doc.GetPage(i);
                var pageSize = page.GetPageSize();
                var canvas = new PdfCanvas(page.NewContentStreamBefore(), page.GetResources(), doc);

                float imgW = imgData.GetWidth() * scale;
                float imgH = imgData.GetHeight() * scale;
                var (x, y) = GetPosition(pageSize, position, imgW, imgH);

                canvas.SaveState();

                var gs = new PdfExtGState();
                gs.SetFillOpacity(opacity);
                gs.SetStrokeOpacity(opacity);
                canvas.SetExtGState(gs);

                canvas.AddImageAt(imgData, x, y, false);
                canvas.RestoreState();
                canvas.Release();
            }

            doc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    private static (float x, float y) GetPosition(
        Rectangle pageSize,
        WatermarkPosition position,
        float elementW = 0,
        float elementH = 0)
    {
        float margin = 20f;
        float pw = pageSize.GetWidth();
        float ph = pageSize.GetHeight();

        return position switch
        {
            WatermarkPosition.Center       => (pw / 2 - elementW / 2, ph / 2 - elementH / 2),
            WatermarkPosition.TopLeft      => (margin, ph - elementH - margin),
            WatermarkPosition.TopRight     => (pw - elementW - margin, ph - elementH - margin),
            WatermarkPosition.TopCenter    => (pw / 2 - elementW / 2, ph - elementH - margin),
            WatermarkPosition.BottomLeft   => (margin, margin),
            WatermarkPosition.BottomRight  => (pw - elementW - margin, margin),
            WatermarkPosition.BottomCenter => (pw / 2 - elementW / 2, margin),
            _                              => (pw / 2, ph / 2)
        };
    }
}
