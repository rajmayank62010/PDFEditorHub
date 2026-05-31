using iText.Kernel.Pdf;
using PDFEditorHub.Domain.Interfaces;

namespace PDFEditorHub.Infrastructure.PdfServices;

public class PdfSecurityService : IPdfSecurityService
{
    public async Task<byte[]> AddPasswordAsync(
        byte[] pdfData,
        string userPassword,
        string? ownerPassword,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();

            var writerProps = new WriterProperties()
                .SetStandardEncryption(
                    System.Text.Encoding.UTF8.GetBytes(userPassword),
                    System.Text.Encoding.UTF8.GetBytes(ownerPassword ?? userPassword),
                    EncryptionConstants.ALLOW_PRINTING | EncryptionConstants.ALLOW_COPY,
                    EncryptionConstants.ENCRYPTION_AES_256);

            using var reader = new PdfReader(inputStream);
            using var writer = new PdfWriter(outputStream, writerProps);
            using var doc = new PdfDocument(reader, writer);
            doc.Close();

            return outputStream.ToArray();
        }, ct);
    }

    public async Task<byte[]> RemovePasswordAsync(
        byte[] pdfData,
        string password,
        CancellationToken ct = default)
    {
        return await Task.Run(() =>
        {
            using var inputStream = new MemoryStream(pdfData);
            using var outputStream = new MemoryStream();

            var readerProps = new ReaderProperties()
                .SetPassword(System.Text.Encoding.UTF8.GetBytes(password));

            using var reader = new PdfReader(inputStream, readerProps);
            using var writer = new PdfWriter(outputStream);
            using var doc = new PdfDocument(reader, writer);
            doc.Close();

            return outputStream.ToArray();
        }, ct);
    }
}
