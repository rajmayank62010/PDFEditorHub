using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using PDFEditorHub.Domain.Enums;
using PDFEditorHub.Domain.Interfaces;
using DomainAnnotation = PDFEditorHub.Domain.Interfaces.PdfAnnotation;

// Alias iText annotation types to avoid name clash with our domain PdfAnnotation record
using ITextTextAnnotation = iText.Kernel.Pdf.Annot.PdfTextAnnotation;
using ITextMarkupAnnotation = iText.Kernel.Pdf.Annot.PdfTextMarkupAnnotation;

namespace PDFEditorHub.Infrastructure.PdfServices;

public class PdfEditService : IPdfEditService
{
    public async Task<byte[]> ApplyAnnotationsAsync(
        byte[] pdfData,
        IEnumerable<DomainAnnotation> annotations,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();
            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream);
            using var doc = new PdfDocument(reader, writer);

            foreach (var ann in annotations)
            {
                ct.ThrowIfCancellationRequested();
                if (ann.Page < 1 || ann.Page > doc.GetNumberOfPages()) continue;

                var page = doc.GetPage(ann.Page);
                var color = ParseColor(ann.Color);

                switch (ann.Type)
                {
                    case EditOperationType.AddText:
                        AddText(page, ann, color);
                        break;
                    case EditOperationType.AddShape:
                        AddShape(page, ann, color);
                        break;
                    case EditOperationType.Highlight:
                        AddHighlight(page, ann);
                        break;
                    case EditOperationType.Underline:
                        AddUnderline(page, ann, color);
                        break;
                    case EditOperationType.Strikethrough:
                        AddStrikethrough(page, ann, color);
                        break;
                    case EditOperationType.AddComment:
                        AddComment(page, ann);
                        break;
                }
            }

            doc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    private static void AddText(PdfPage page, DomainAnnotation ann, Color color)
    {
        var canvas = new PdfCanvas(page);
        var font = PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA);
        canvas.BeginText()
              .SetFontAndSize(font, ann.FontSize)
              .SetFillColor(color)
              .MoveText(ann.X, ann.Y)
              .ShowText(ann.Text ?? string.Empty)
              .EndText();
        canvas.Release();
    }

    private static void AddShape(PdfPage page, DomainAnnotation ann, Color color)
    {
        var canvas = new PdfCanvas(page);
        canvas.SetStrokeColor(color).SetLineWidth(2f);

        switch (ann.Shape)
        {
            case ShapeType.Rectangle:
                canvas.Rectangle(ann.X, ann.Y, ann.Width, ann.Height).Stroke();
                break;
            case ShapeType.Circle:
                canvas.Ellipse(ann.X, ann.Y, ann.X + ann.Width, ann.Y + ann.Height).Stroke();
                break;
            case ShapeType.Line:
            case ShapeType.Arrow:
                canvas.MoveTo(ann.X, ann.Y)
                      .LineTo(ann.X + ann.Width, ann.Y + ann.Height)
                      .Stroke();
                break;
        }
        canvas.Release();
    }

    private static void AddHighlight(PdfPage page, DomainAnnotation ann)
    {
        var rect = new Rectangle(ann.X, ann.Y, ann.Width, ann.Height);
        var highlight = new ITextMarkupAnnotation(
            rect,
            iText.Kernel.Pdf.PdfName.Highlight,
            new float[]
            {
                ann.X,           ann.Y,
                ann.X + ann.Width, ann.Y,
                ann.X + ann.Width, ann.Y + ann.Height,
                ann.X,           ann.Y + ann.Height
            });
        highlight.SetColor(new float[] { 1f, 1f, 0f }); // Yellow
        page.AddAnnotation(highlight);
    }

    private static void AddUnderline(PdfPage page, DomainAnnotation ann, Color color)
    {
        var canvas = new PdfCanvas(page);
        canvas.SetStrokeColor(color).SetLineWidth(1f)
              .MoveTo(ann.X, ann.Y)
              .LineTo(ann.X + ann.Width, ann.Y)
              .Stroke();
        canvas.Release();
    }

    private static void AddStrikethrough(PdfPage page, DomainAnnotation ann, Color color)
    {
        var canvas = new PdfCanvas(page);
        float midY = ann.Y + ann.Height / 2f;
        canvas.SetStrokeColor(color).SetLineWidth(1f)
              .MoveTo(ann.X, midY)
              .LineTo(ann.X + ann.Width, midY)
              .Stroke();
        canvas.Release();
    }

    private static void AddComment(PdfPage page, DomainAnnotation ann)
    {
        var rect = new Rectangle(ann.X, ann.Y, 20, 20);
        var comment = new ITextTextAnnotation(rect);
        comment.SetContents(ann.Text ?? "Comment");
        comment.SetOpen(false);
        page.AddAnnotation(comment);
    }

    private static Color ParseColor(string hex)
    {
        try
        {
            hex = hex.TrimStart('#');
            if (hex.Length < 6) return ColorConstants.BLACK;
            int r = Convert.ToInt32(hex[..2], 16);
            int g = Convert.ToInt32(hex[2..4], 16);
            int b = Convert.ToInt32(hex[4..6], 16);
            return new DeviceRgb(r, g, b);
        }
        catch
        {
            return ColorConstants.BLACK;
        }
    }
}
