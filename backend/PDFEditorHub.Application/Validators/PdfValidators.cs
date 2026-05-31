using FluentValidation;
using PDFEditorHub.Application.DTOs;

namespace PDFEditorHub.Application.Validators;

public class MergeRequestValidator : AbstractValidator<MergeRequestDto>
{
    public MergeRequestValidator()
    {
        RuleFor(x => x.FileIds)
            .NotEmpty().WithMessage("At least 2 files are required for merging.")
            .Must(ids => ids.Count >= 2).WithMessage("At least 2 files are required for merging.")
            .Must(ids => ids.Count <= 10).WithMessage("Maximum 10 files can be merged at once.");

        RuleForEach(x => x.FileIds)
            .NotEmpty().WithMessage("File ID cannot be empty.");
    }
}

public class SplitRequestValidator : AbstractValidator<SplitRequestDto>
{
    private static readonly string[] ValidModes = ["byRange", "allPages", "extractPages"];

    public SplitRequestValidator()
    {
        RuleFor(x => x.FileId).NotEmpty().WithMessage("File ID is required.");
        RuleFor(x => x.SplitMode)
            .Must(m => ValidModes.Contains(m, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Split mode must be one of: {string.Join(", ", ValidModes)}");

        When(x => x.SplitMode.Equals("byRange", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.PageRanges)
                .NotEmpty().WithMessage("Page ranges are required for byRange split mode.")
                .Matches(@"^[\d\s,\-]+$").WithMessage("Invalid page range format. Use format like: 1-3, 5, 7-9");
        });

        When(x => x.SplitMode.Equals("extractPages", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.Pages)
                .NotEmpty().WithMessage("Page numbers are required for extractPages mode.")
                .Must(p => p!.All(n => n > 0)).WithMessage("Page numbers must be positive integers.");
        });
    }
}

public class CompressRequestValidator : AbstractValidator<CompressRequestDto>
{
    private static readonly string[] ValidLevels = ["low", "medium", "high"];

    public CompressRequestValidator()
    {
        RuleFor(x => x.FileId).NotEmpty().WithMessage("File ID is required.");
        RuleFor(x => x.CompressionLevel)
            .Must(l => ValidLevels.Contains(l, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Compression level must be one of: {string.Join(", ", ValidLevels)}");
    }
}

public class WatermarkRequestValidator : AbstractValidator<WatermarkRequestDto>
{
    public WatermarkRequestValidator()
    {
        RuleFor(x => x.FileId).NotEmpty().WithMessage("File ID is required.");
        RuleFor(x => x.WatermarkType)
            .Must(t => t.Equals("text", StringComparison.OrdinalIgnoreCase) ||
                       t.Equals("image", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Watermark type must be 'text' or 'image'.");

        When(x => x.WatermarkType.Equals("text", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.Text).NotEmpty().WithMessage("Text is required for text watermarks.");
            RuleFor(x => x.FontSize).InclusiveBetween(8, 200).WithMessage("Font size must be between 8 and 200.");
        });

        RuleFor(x => x.Opacity).InclusiveBetween(0.01f, 1.0f).WithMessage("Opacity must be between 0.01 and 1.0.");
    }
}

public class SignRequestValidator : AbstractValidator<SignRequestDto>
{
    private static readonly string[] ValidTypes = ["draw", "upload", "type"];

    public SignRequestValidator()
    {
        RuleFor(x => x.FileId).NotEmpty().WithMessage("File ID is required.");
        RuleFor(x => x.SignatureType)
            .Must(t => ValidTypes.Contains(t, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Signature type must be one of: {string.Join(", ", ValidTypes)}");
        RuleFor(x => x.SignatureData).NotEmpty().WithMessage("Signature data is required.");
        RuleFor(x => x.Page).GreaterThan(0).WithMessage("Page number must be positive.");
        RuleFor(x => x.Width).GreaterThan(0).WithMessage("Width must be positive.");
        RuleFor(x => x.Height).GreaterThan(0).WithMessage("Height must be positive.");
    }
}

public class ConvertRequestValidator : AbstractValidator<ConvertRequestDto>
{
    private static readonly string[] ValidFormats = ["jpg", "png", "txt", "docx", "pdf"];

    public ConvertRequestValidator()
    {
        RuleFor(x => x.FileId).NotEmpty().WithMessage("File ID is required.");
        RuleFor(x => x.OutputFormat)
            .Must(f => ValidFormats.Contains(f, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Output format must be one of: {string.Join(", ", ValidFormats)}");
    }
}

public class EditRequestValidator : AbstractValidator<EditRequestDto>
{
    public EditRequestValidator()
    {
        RuleFor(x => x.FileId).NotEmpty().WithMessage("File ID is required.");
        RuleFor(x => x.Operations)
            .NotEmpty().WithMessage("At least one edit operation is required.")
            .Must(ops => ops.Count <= 100).WithMessage("Maximum 100 operations per request.");
    }
}

public class PageManageRequestValidator : AbstractValidator<PageManageRequestDto>
{
    private static readonly string[] ValidTypes = ["rotate", "delete", "duplicate", "reorder", "extract"];

    public PageManageRequestValidator()
    {
        RuleFor(x => x.FileId).NotEmpty().WithMessage("File ID is required.");
        RuleFor(x => x.Operations)
            .NotEmpty().WithMessage("At least one page operation is required.");

        RuleForEach(x => x.Operations).ChildRules(op =>
        {
            op.RuleFor(o => o.Type)
                .Must(t => ValidTypes.Contains(t, StringComparer.OrdinalIgnoreCase))
                .WithMessage($"Operation type must be one of: {string.Join(", ", ValidTypes)}");
            op.RuleFor(o => o.PageNumber).GreaterThan(0).WithMessage("Page number must be positive.");
        });
    }
}

public class SecurityRequestValidator : AbstractValidator<SecurityRequestDto>
{
    private static readonly string[] ValidActions = ["addPassword", "removePassword", "setPermissions"];

    public SecurityRequestValidator()
    {
        RuleFor(x => x.FileId).NotEmpty().WithMessage("File ID is required.");
        RuleFor(x => x.Action)
            .Must(a => ValidActions.Contains(a, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Action must be one of: {string.Join(", ", ValidActions)}");

        When(x => x.Action.Equals("addPassword", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(4).WithMessage("Password must be at least 4 characters.");
        });

        When(x => x.Action.Equals("removePassword", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Current password is required to remove protection.");
        });
    }
}
