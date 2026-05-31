namespace PDFEditorHub.Domain.Enums;

public enum CompressionLevel
{
    Low,
    Medium,
    High
}

public enum WatermarkType
{
    Text,
    Image
}

public enum WatermarkPosition
{
    Center,
    TopLeft,
    TopRight,
    TopCenter,
    BottomLeft,
    BottomRight,
    BottomCenter
}

public enum SignatureType
{
    Draw,
    Upload,
    Type
}

public enum ConversionFormat
{
    Jpg,
    Png,
    Txt,
    Docx,
    Pdf
}

public enum SplitMode
{
    ByRange,
    AllPages,
    ExtractPages
}

public enum PageOperationType
{
    Rotate,
    Delete,
    Duplicate,
    Reorder,
    Extract
}

public enum EditOperationType
{
    AddText,
    AddShape,
    Highlight,
    Underline,
    Strikethrough,
    AddComment
}

public enum ShapeType
{
    Rectangle,
    Circle,
    Arrow,
    Line
}

public enum SecurityAction
{
    AddPassword,
    RemovePassword,
    SetPermissions
}
