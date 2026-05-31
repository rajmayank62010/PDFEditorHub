import { CheckCircle, Download, Loader2, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface ProcessingModalProps {
  isOpen: boolean
  stage: 'processing' | 'done' | 'error'
  progress?: number
  message?: string
  fileName?: string
  onDownload?: () => void
  onClose?: () => void
  isDownloading?: boolean
}

export default function ProcessingModal({
  isOpen,
  stage,
  progress = 0,
  message,
  fileName,
  onDownload,
  onClose,
  isDownloading,
}: ProcessingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full bounce-in">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Icon */}
          <div className={clsx(
            'w-20 h-20 rounded-full flex items-center justify-center',
            stage === 'processing' && 'bg-primary-100',
            stage === 'done' && 'bg-green-100',
            stage === 'error' && 'bg-red-100',
          )}>
            {stage === 'processing' && (
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            )}
            {stage === 'done' && (
              <CheckCircle className="w-10 h-10 text-green-600" />
            )}
            {stage === 'error' && (
              <AlertCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          {/* Text */}
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {stage === 'processing' && 'Processing your PDF...'}
              {stage === 'done' && 'Done! Your file is ready'}
              {stage === 'error' && 'Something went wrong'}
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              {message || (stage === 'processing'
                ? 'Please wait while we process your file securely.'
                : stage === 'done'
                ? 'Your file has been processed and is ready to download.'
                : 'An error occurred while processing your file.'
              )}
            </p>
          </div>

          {/* Progress */}
          {stage === 'processing' && (
            <div className="w-full">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{progress}% complete</p>
            </div>
          )}

          {/* Privacy note */}
          {stage === 'processing' && (
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-2">
              🔒 Your file is processed securely and will be automatically deleted after download.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 w-full">
            {stage === 'done' && onDownload && (
              <button
                onClick={onDownload}
                disabled={isDownloading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? 'Downloading...' : `Download ${fileName || 'File'}`}
              </button>
            )}
            {(stage === 'done' || stage === 'error') && onClose && (
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                {stage === 'done' ? 'Process Another' : 'Try Again'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
