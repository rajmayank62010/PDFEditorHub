// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface UploadResponse {
  fileId: string
  fileName: string
  fileSize: number
  pageCount: number
  expiresAt: string
}

export interface ProcessResponse {
  downloadId: string
  fileName: string
  fileSize: number
  downloadUrl: string
  expiresAt: string
}

export interface MergeRequest {
  fileIds: string[]
  outputFileName?: string
}

export interface SplitRequest {
  fileId: string
  splitMode: 'byRange' | 'allPages' | 'extractPages'
  pageRanges?: string
  pages?: number[]
}

export interface CompressRequest {
  fileId: string
  compressionLevel: 'low' | 'medium' | 'high'
}

export interface CompressResponse extends ProcessResponse {
  originalSize: number
  compressedSize: number
  reductionPercent: number
}

export interface WatermarkRequest {
  fileId: string
  watermarkType: 'text' | 'image'
  text?: string
  fontSize?: number
  opacity?: number
  rotation?: number
  position?: WatermarkPosition
  imageFileId?: string
  scale?: number
}

export type WatermarkPosition =
  | 'center'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'topCenter'
  | 'bottomCenter'

export interface SignRequest {
  fileId: string
  signatureType: 'draw' | 'upload' | 'type'
  signatureData: string // base64 or text
  page: number
  x: number
  y: number
  width: number
  height: number
}

export interface ConvertRequest {
  fileId: string
  outputFormat: 'jpg' | 'png' | 'txt' | 'docx' | 'pdf'
}

export interface EditRequest {
  fileId: string
  operations: EditOperation[]
}

export interface EditOperation {
  type: 'addText' | 'addShape' | 'highlight' | 'underline' | 'strikethrough' | 'addComment'
  page: number
  x: number
  y: number
  width?: number
  height?: number
  text?: string
  fontSize?: number
  color?: string
  opacity?: number
  shapeType?: 'rectangle' | 'circle' | 'arrow' | 'line'
}

export interface PageManageRequest {
  fileId: string
  operations: PageOperation[]
}

export interface PageOperation {
  type: 'rotate' | 'delete' | 'duplicate' | 'reorder' | 'extract'
  pageNumber: number
  rotation?: 90 | 180 | 270
  newPosition?: number
}

export interface SecurityRequest {
  fileId: string
  action: 'addPassword' | 'removePassword' | 'setPermissions'
  password?: string
  ownerPassword?: string
  permissions?: PdfPermissions
}

export interface PdfPermissions {
  allowPrinting: boolean
  allowCopying: boolean
  allowEditing: boolean
  allowAnnotating: boolean
}

// UI types
export interface ToolCard {
  id: string
  title: string
  description: string
  icon: string
  href: string
  color: string
  bgColor: string
}

export interface FileWithPreview extends File {
  preview?: string
  id?: string
  pageCount?: number
}

export interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  status: 'uploading' | 'ready' | 'processing' | 'done' | 'error'
  progress?: number
  error?: string
  fileId?: string
  pageCount?: number
}

export interface ProcessingState {
  isProcessing: boolean
  progress: number
  stage: string
  error?: string
}

export interface DownloadResult {
  downloadId: string
  fileName: string
  downloadUrl: string
}
