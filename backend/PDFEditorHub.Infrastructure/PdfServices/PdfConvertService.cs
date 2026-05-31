using iText.IO.Image;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using PDFEditorHub.Domain.Enums;
using PDFEditorHub.Domain.Interfaces;
using SkiaSharp;
using System.Text;

// Alias conflicting OpenXml types
using OxDocument  = DocumentFormat.OpenXml.Wordprocessing.Document;
using OxBody      = DocumentFormat.OpenXml.Wordprocessing.Body;
using OxParagraph = DocumentFormat.OpenXml.Wordprocessing.Paragraph;
using OxRun       = DocumentFormat.OpenXml.Wordprocessing.Run;
using OxText      = DocumentFormat.OpenXml.Wordprocessing.Text;
using OxRunProps  = DocumentFormat.OpenXml.Wordprocessing.RunProperties;
using OxFontSize  = DocumentFormat.OpenXml.Wordprocessing.FontSize;
using OxParaProps = DocumentFormat.OpenXml.Wordprocessing.ParagraphProperties;
using OxSpacing   = DocumentFormat.OpenXml.Wordprocessing.SpacingBetweenLines;
using OxStyles    = DocumentFormat.OpenXml.Wordprocessing.Styles;

// Alias iText layout types
using ITextDocument  = iText.Layout.Document;
using ITextParagraph = iText.Layout.Element.Paragraph;
using ITextImage     = iText.Layout.Element.Image;
using ITextAreaBreak = iText.Layout.Element.AreaBreak;

using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;

namespace PDFEditorHub.Infrastructure.PdfServices;

public class PdfConvertService : IPdfConvertService
{
    // ─── PDF → Images ─────────────────────────────────────────────────────────
    public async Task<IEnumerable<byte[]>> PdfToImagesAsync(
        byte[] pdfData,
        ConversionFormat format,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            var results = new List<byte[]>();

            using var inputStream = new MemoryStream(pdfData);
            using var reader = new PdfReader(inputStream);
            using var doc = new PdfDocument(reader);

            int pageCount = doc.GetNumberOfPages();

            for (int i = 1; i <= pageCount; i++)
            {
                ct.ThrowIfCancellationRequested();

                var page = doc.GetPage(i);
                var pageSize = page.GetPageSize();

                int width  = (int)(pageSize.GetWidth()  * 1.5f);
                int height = (int)(pageSize.GetHeight() * 1.5f);

                using var bitmap = new SKBitmap(width, height);
                using var canvas = new SKCanvas(bitmap);
                canvas.Clear(SKColors.White);

                // Page border
                using var borderPaint = new SKPaint
                {
                    Color = SKColors.LightGray,
                    Style = SKPaintStyle.Stroke,
                    StrokeWidth = 2
                };
                canvas.DrawRect(1, 1, width - 2, height - 2, borderPaint);

                // Render extracted text
                var strategy = new SimpleTextExtractionStrategy();
                var text = PdfTextExtractor.GetTextFromPage(page, strategy);

                if (!string.IsNullOrWhiteSpace(text))
                {
                    using var textPaint = new SKPaint
                    {
                        Color = SKColors.Black,
                        TextSize = 12,
                        IsAntialias = true
                    };

                    float yPos   = 40;
                    float margin = 20;
                    float maxW   = width - margin * 2;

                    foreach (var line in text.Split('\n').Take(80))
                    {
                        ct.ThrowIfCancellationRequested();
                        if (yPos > height - 20) break;

                        var words = line.Split(' ');
                        var current = new StringBuilder();

                        foreach (var word in words)
                        {
                            var test = current.Length == 0 ? word : $"{current} {word}";
                            if (textPaint.MeasureText(test) > maxW && current.Length > 0)
                            {
                                canvas.DrawText(current.ToString(), margin, yPos, textPaint);
                                yPos += 16;
                                current.Clear();
                                current.Append(word);
                            }
                            else
                            {
                                current.Clear();
                                current.Append(test);
                            }
                        }

                        if (current.Length > 0)
                        {
                            canvas.DrawText(current.ToString(), margin, yPos, textPaint);
                            yPos += 16;
                        }
                    }
                }

                var skFormat = format == ConversionFormat.Png
                    ? SKEncodedImageFormat.Png
                    : SKEncodedImageFormat.Jpeg;
                int quality = format == ConversionFormat.Png ? 100 : 90;

                using var image   = SKImage.FromBitmap(bitmap);
                using var encoded = image.Encode(skFormat, quality);
                results.Add(encoded.ToArray());
            }

            return (IEnumerable<byte[]>)results;
        }, ct);
    }

    // ─── Images → PDF ─────────────────────────────────────────────────────────
    public async Task<byte[]> ImagesToPdfAsync(
        IEnumerable<byte[]> images,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var outputStream = new MemoryStream();
            using var writer  = new PdfWriter(outputStream);
            using var pdfDoc  = new PdfDocument(writer);
            var layoutDoc = new ITextDocument(pdfDoc);
            layoutDoc.SetMargins(0, 0, 0, 0);

            bool first = true;
            foreach (var imageData in images)
            {
                ct.ThrowIfCancellationRequested();

                if (!first)
                    layoutDoc.Add(new ITextAreaBreak(iText.Layout.Properties.AreaBreakType.NEXT_PAGE));

                var imgData = ImageDataFactory.Create(imageData);
                var img = new ITextImage(imgData);
                img.SetAutoScale(true);
                img.SetHorizontalAlignment(iText.Layout.Properties.HorizontalAlignment.CENTER);
                layoutDoc.Add(img);
                first = false;
            }

            layoutDoc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    // ─── PDF → Text ───────────────────────────────────────────────────────────
    public async Task<byte[]> PdfToTextAsync(
        byte[] pdfData,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            var sb = new StringBuilder();
            using var inputStream = new MemoryStream(pdfData);
            using var reader = new PdfReader(inputStream);
            using var doc = new PdfDocument(reader);

            for (int i = 1; i <= doc.GetNumberOfPages(); i++)
            {
                ct.ThrowIfCancellationRequested();
                var strategy = new SimpleTextExtractionStrategy();
                var text = PdfTextExtractor.GetTextFromPage(doc.GetPage(i), strategy);
                sb.AppendLine($"=== Page {i} ===");
                sb.AppendLine(text);
                sb.AppendLine();
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }, ct);
    }

    // ─── PDF → DOCX ───────────────────────────────────────────────────────────
    public async Task<byte[]> PdfToDocxAsync(
        byte[] pdfData,
        CancellationToken ct = default)
    {
        var textBytes = await PdfToTextAsync(pdfData, ct);
        var text = Encoding.UTF8.GetString(textBytes);
        return await Task.Run(() => BuildDocx(text, ct), ct);
    }

    // ─── DOCX → PDF ───────────────────────────────────────────────────────────
    public async Task<byte[]> DocxToPdfAsync(
        byte[] docxData,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            var text = ExtractTextFromDocx(docxData);

            using var outputStream = new MemoryStream();
            using var writer  = new PdfWriter(outputStream);
            using var pdfDoc  = new PdfDocument(writer);
            var layoutDoc = new ITextDocument(pdfDoc);
            layoutDoc.SetMargins(72, 72, 72, 72);

            var font = iText.Kernel.Font.PdfFontFactory.CreateFont(
                iText.IO.Font.Constants.StandardFonts.HELVETICA);

            foreach (var line in text.Split('\n'))
            {
                ct.ThrowIfCancellationRequested();
                var para = new ITextParagraph(line.TrimEnd())
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetMultipliedLeading(1.2f);
                layoutDoc.Add(para);
            }

            layoutDoc.Close();
            return outputStream.ToArray();
        }, ct);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static string ExtractTextFromDocx(byte[] docxData)
    {
        try
        {
            using var ms = new MemoryStream(docxData);
            using var wordDoc = WordprocessingDocument.Open(ms, false);
            var body = wordDoc.MainDocumentPart?.Document?.Body;
            if (body == null) return string.Empty;

            var sb = new StringBuilder();
            foreach (var para in body.Elements<OxParagraph>())
                sb.AppendLine(para.InnerText);

            return sb.ToString();
        }
        catch
        {
            return string.Empty;
        }
    }

    private static byte[] BuildDocx(string text, CancellationToken ct)
    {
        using var ms = new MemoryStream();
        using var wordDoc = WordprocessingDocument.Create(ms, WordprocessingDocumentType.Document);

        var mainPart = wordDoc.AddMainDocumentPart();
        mainPart.Document = new OxDocument();
        var body = new OxBody();

        var stylesPart = mainPart.AddNewPart<StyleDefinitionsPart>();
        stylesPart.Styles = new OxStyles();

        foreach (var line in text.Split('\n'))
        {
            ct.ThrowIfCancellationRequested();

            var para = new OxParagraph();
            var props = new OxParaProps();
            props.Append(new OxSpacing { After = "120" });
            para.Append(props);

            var run = new OxRun();
            var runProps = new OxRunProps();
            runProps.Append(new OxFontSize { Val = "22" }); // 11pt
            run.Append(runProps);
            run.Append(new OxText(line.TrimEnd())
            {
                Space = SpaceProcessingModeValues.Preserve
            });
            para.Append(run);
            body.Append(para);
        }

        mainPart.Document.Append(body);
        mainPart.Document.Save();

        return ms.ToArray();
    }
}
