import { useState } from 'react'
import { Archive, TrendingDown } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { compressPdf } from '@/services/api'
import type { CompressResponse } from '@/types'
import { clsx } from 'clsx'
import { formatBytes } from '@/utils/format'

type CompressionLevel = 'low' | 'medium' | 'high'

const compressionOptions = [
  {
    value: 'low' as CompressionLevel,
    label: 'Low Compression',
    desc: 'Best quality, smaller size reduction',
    reduction: '~20-30%',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    activeBorder: 'border-green-500',
  },
  {
    value: 'medium' as CompressionLevel,
    label: 'Medium Compression',
    desc: 'Balanced quality and size',
    reduction: '~40-60%',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    activeBorder: 'border-orange-500',
  },
  {
    value: 'high' as CompressionLevel,
    label: 'High Compression',
    desc: 'Maximum size reduction',
    reduction: '~60-80%',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    activeBorder: 'border-red-500',
  },
]

const faqs = [
  {
    question: 'How much can I compress a PDF?',
    answer: 'Compression depends on the PDF content. PDFs with many images can be compressed by 60-80%. Text-heavy PDFs may see 20-40% reduction.',
  },
  {
    question: 'Will compression affect PDF quality?',
    answer: 'Low compression maintains near-original quality. Medium compression is barely noticeable. High compression may reduce image quality slightly but keeps text sharp.',
  },
  {
    question: 'What is the maximum file size for compression?',
    answer: 'You can compress PDF files up to 50MB in size.',
  },
]

export default function CompressPdfPage() {
  const [level, setLevel] = useState<CompressionLevel>('medium')
  const [result, setResult] = useState<CompressResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { download, isDownloading } = useDownload()

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    maxFiles: 1,
    onError: (err) => alert(err),
  })

  const compressMutation = useMutation({
    mutationFn: () => compressPdf({ fileId: readyFiles[0].fileId!, compressionLevel: level }),
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Compression failed')
    },
  })

  const schemas = [
    toolSchema('Compress PDF Online', 'Reduce PDF file size online for free with three compression levels.', '/compress-pdf'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Compress PDF', url: '/compress-pdf' }]),
  ]

  return (
    <>
      <SEOHead
        title="Compress PDF Online Free - Reduce PDF File Size"
        description="Compress PDF files online for free. Choose from low, medium, or high compression. Reduce PDF size without losing quality. No registration required."
        canonical="/compress-pdf"
        keywords="compress PDF, reduce PDF size, PDF compressor online free, shrink PDF"
        schema={schemas}
      />
      <ToolPageLayout
        title="Compress PDF"
        description="Reduce your PDF file size while maintaining quality. Choose your compression level."
        icon={<Archive className="w-7 h-7 text-green-600" />}
        iconBg="bg-green-50"
        faqs={faqs}
        breadcrumb={[{ label: 'Compress PDF' }]}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <FileDropzone
            onFilesAdded={addFiles}
            files={files}
            onRemoveFile={removeFile}
            multiple={false}
            maxFiles={1}
            label="Drop a PDF file here or click to browse"
            sublabel="Upload one PDF to compress — up to 50MB"
          />

          {readyFiles.length > 0 && (
            <>
              {/* Compression Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Compression Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {compressionOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLevel(opt.value)}
                      className={clsx(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        level === opt.value
                          ? `${opt.activeBorder} ${opt.bg}`
                          : `${opt.border} hover:border-gray-300`
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className={clsx('font-semibold text-sm', opt.color)}>{opt.label}</p>
                        <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', opt.bg, opt.color)}>
                          {opt.reduction}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => compressMutation.mutate()}
                  disabled={isUploading || compressMutation.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <TrendingDown className="w-4 h-4" />
                  Compress PDF
                </button>
              </div>
            </>
          )}
        </div>

        {/* Result Stats */}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Compression Results
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(result.originalSize)}</p>
                <p className="text-xs text-gray-500 mt-1">Original Size</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{formatBytes(result.compressedSize)}</p>
                <p className="text-xs text-gray-500 mt-1">Compressed Size</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{result.reductionPercent}%</p>
                <p className="text-xs text-gray-500 mt-1">Size Reduction</p>
              </div>
            </div>
          </div>
        )}
      </ToolPageLayout>

      <ProcessingModal
        isOpen={modalOpen}
        stage={compressMutation.isPending ? 'processing' : result ? 'done' : 'error'}
        progress={compressMutation.isPending ? 60 : 100}
        message={compressMutation.error instanceof Error ? compressMutation.error.message : undefined}
        fileName={result?.fileName}
        onDownload={() => result && download(result.downloadId, result.fileName)}
        onClose={() => { setModalOpen(false); setResult(null) }}
        isDownloading={isDownloading}
      />
    </>
  )
}
