import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import type { UploadedFile } from '@/types'
import { formatBytes } from '@/utils/format'

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void
  files?: UploadedFile[]
  onRemoveFile?: (id: string) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  label?: string
  sublabel?: string
  className?: string
  multiple?: boolean
}

export default function FileDropzone({
  onFilesAdded,
  files = [],
  onRemoveFile,
  accept = { 'application/pdf': ['.pdf'] },
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024,
  label = 'Drop PDF files here or click to browse',
  sublabel = 'Supports PDF up to 50MB',
  className,
  multiple = true,
}: FileDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles)
  }, [onFilesAdded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
  })

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={clsx(
          'upload-zone',
          isDragActive && 'upload-zone-active'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={clsx(
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
            isDragActive ? 'bg-primary-100' : 'bg-gray-100'
          )}>
            <Upload className={clsx(
              'w-8 h-8 transition-colors',
              isDragActive ? 'text-primary-600' : 'text-gray-400'
            )} />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-700">{label}</p>
            <p className="text-sm text-gray-500 mt-1">{sublabel}</p>
          </div>
          <button
            type="button"
            className="btn-primary text-sm py-2 px-6"
            onClick={(e) => e.stopPropagation()}
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                  {file.pageCount && (
                    <span className="text-xs text-gray-400">• {file.pageCount} pages</span>
                  )}
                </div>
                {file.status === 'uploading' && (
                  <div className="progress-bar mt-1.5">
                    <div
                      className="progress-fill"
                      style={{ width: `${file.progress || 0}%` }}
                    />
                  </div>
                )}
                {file.status === 'error' && (
                  <p className="text-xs text-red-500 mt-0.5">{file.error}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {file.status === 'uploading' && (
                  <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                )}
                {file.status === 'ready' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                {onRemoveFile && (
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
