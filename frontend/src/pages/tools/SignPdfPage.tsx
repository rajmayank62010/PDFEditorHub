import { useState, useRef, useEffect, useCallback } from 'react'
import { PenTool, Type, Upload as UploadIcon, RotateCcw, AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { signPdf } from '@/services/api'
import type { ProcessResponse } from '@/types'
import { clsx } from 'clsx'

type SignMode = 'draw' | 'type' | 'upload'

const faqs = [
  {
    question: 'How do I sign a PDF online?',
    answer:
      'Upload your PDF, choose a signature method (draw, type, or upload an image), create your signature, set the page number, and click Sign PDF.',
  },
  {
    question: 'Is my signature secure?',
    answer:
      'Yes. Your signature data is processed securely and the signed PDF is automatically deleted after you download it.',
  },
  {
    question: 'Can I draw my signature?',
    answer:
      'Yes — draw with your mouse or touchscreen, type your name in a handwriting style, or upload a PNG/JPG image of your signature.',
  },
]

export default function SignPdfPage() {
  const [signMode, setSignMode] = useState<SignMode>('draw')
  const [typedSignature, setTypedSignature] = useState('')
  const [uploadedSigDataUrl, setUploadedSigDataUrl] = useState<string | null>(null)
  const [uploadSigError, setUploadSigError] = useState<string | null>(null)
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [page, setPage] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { download, isDownloading } = useDownload()

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    maxFiles: 1,
    onError: (err) => alert(err),
  })

  // Initialise canvas drawing style
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#1E40AF'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [signMode])

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDraw = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // Handle signature image upload
  const handleSigImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUploadSigError(null)
      const file = e.target.files?.[0]
      if (!file) return

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setUploadSigError('Please upload a PNG or JPG image.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadSigError('Signature image must be under 5 MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = (ev) => {
        setUploadedSigDataUrl(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    },
    [],
  )

  const getSignatureData = (): string => {
    switch (signMode) {
      case 'draw':
        return canvasRef.current?.toDataURL('image/png') ?? ''
      case 'type':
        return typedSignature
      case 'upload':
        return uploadedSigDataUrl ?? ''
      default:
        return ''
    }
  }

  const isSignatureReady = (): boolean => {
    switch (signMode) {
      case 'draw': {
        const canvas = canvasRef.current
        if (!canvas) return false
        const ctx = canvas.getContext('2d')
        if (!ctx) return false
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        return data.some((v, i) => i % 4 === 3 && v > 0) // any non-transparent pixel
      }
      case 'type':
        return typedSignature.trim().length > 0
      case 'upload':
        return uploadedSigDataUrl !== null
    }
  }

  const signMutation = useMutation({
    mutationFn: () =>
      signPdf({
        fileId: readyFiles[0].fileId!,
        signatureType: signMode,
        signatureData: getSignatureData(),
        page,
        x: 100,
        y: 100,
        width: 200,
        height: 60,
      }),
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Signing failed')
    },
  })

  const schemas = [
    toolSchema('Sign PDF Online', 'Sign PDF documents online for free. Draw, type, or upload your signature.', '/sign-pdf'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Sign PDF', url: '/sign-pdf' }]),
  ]

  return (
    <>
      <SEOHead
        title="Sign PDF Online Free - Add Signature to PDF"
        description="Sign PDF documents online for free. Draw, type, or upload your signature. No registration required. Secure and private PDF signing."
        canonical="/sign-pdf"
        keywords="sign PDF online, add signature to PDF, PDF signature free, electronic signature PDF"
        schema={schemas}
      />
      <ToolPageLayout
        title="Sign PDF"
        description="Add your signature to any PDF document. Draw, type, or upload your signature."
        icon={<PenTool className="w-7 h-7 text-indigo-600" />}
        iconBg="bg-indigo-50"
        faqs={faqs}
        breadcrumb={[{ label: 'Sign PDF' }]}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <FileDropzone
            onFilesAdded={addFiles}
            files={files}
            onRemoveFile={removeFile}
            multiple={false}
            maxFiles={1}
            label="Drop a PDF file here or click to browse"
            sublabel="Upload the PDF you want to sign — up to 50 MB"
          />

          {readyFiles.length > 0 && (
            <>
              {/* Signature Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Signature Method
                </label>
                <div className="flex gap-3 flex-wrap">
                  {(
                    [
                      { value: 'draw', label: 'Draw', icon: PenTool },
                      { value: 'type', label: 'Type', icon: Type },
                      { value: 'upload', label: 'Upload Image', icon: UploadIcon },
                    ] as const
                  ).map((mode) => {
                    const Icon = mode.icon
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setSignMode(mode.value)}
                        className={clsx(
                          'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                          signMode === mode.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300',
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {mode.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Draw */}
              {signMode === 'draw' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Draw your signature
                    </label>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl cursor-crosshair bg-gray-50 touch-none"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Draw your signature using your mouse or touchscreen
                  </p>
                </div>
              )}

              {/* Type */}
              {signMode === 'type' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type your signature
                  </label>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-2xl"
                    style={{ fontFamily: 'cursive' }}
                  />
                </div>
              )}

              {/* Upload */}
              {signMode === 'upload' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload signature image
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
                    <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      {uploadedSigDataUrl ? 'Signature loaded — click to replace' : 'Click to upload PNG or JPG'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Max 5 MB</p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleSigImageUpload}
                    />
                  </label>
                  {uploadSigError && (
                    <p className="flex items-center gap-1 text-xs text-red-500 mt-2">
                      <AlertCircle className="w-3 h-3" /> {uploadSigError}
                    </p>
                  )}
                  {uploadedSigDataUrl && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Preview:</p>
                      <img
                        src={uploadedSigDataUrl}
                        alt="Signature preview"
                        className="max-h-20 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Page */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Page to sign
                </label>
                <input
                  type="number"
                  min={1}
                  value={page}
                  onChange={(e) => setPage(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => signMutation.mutate()}
                  disabled={!isSignatureReady() || isUploading || signMutation.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #3730a3)' }}
                >
                  <PenTool className="w-4 h-4" />
                  Sign PDF
                </button>
              </div>
            </>
          )}
        </div>
      </ToolPageLayout>

      <ProcessingModal
        isOpen={modalOpen}
        stage={signMutation.isPending ? 'processing' : result ? 'done' : 'error'}
        progress={signMutation.isPending ? 60 : 100}
        message={
          signMutation.error instanceof Error ? signMutation.error.message : undefined
        }
        fileName={result?.fileName}
        onDownload={() => result && download(result.downloadId, result.fileName)}
        onClose={() => {
          setModalOpen(false)
          setResult(null)
        }}
        isDownloading={isDownloading}
      />
    </>
  )
}
