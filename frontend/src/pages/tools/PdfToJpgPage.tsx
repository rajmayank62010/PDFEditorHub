import { useState } from 'react'
import { Image } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { convertPdf } from '@/services/api'
import type { ProcessResponse } from '@/types'
import { clsx } from 'clsx'

const faqs = [
  {
    question: 'How do I convert PDF to JPG?',
    answer: 'Upload your PDF file, choose the output format (JPG or PNG), and click Convert. Each page will be converted to a separate image file.',
  },
  {
    question: 'What image quality will the output be?',
    answer: 'We convert PDFs to high-quality images at 150 DPI by default, which is suitable for most uses.',
  },
  {
    question: 'Can I convert a multi-page PDF to images?',
    answer: 'Yes, each page of your PDF will be converted to a separate image. The output will be a ZIP file containing all images.',
  },
]

export default function PdfToJpgPage() {
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg')
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { download, isDownloading } = useDownload()

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    maxFiles: 1,
    onError: (err) => alert(err),
  })

  const convertMutation = useMutation({
    mutationFn: () => convertPdf({ fileId: readyFiles[0].fileId!, outputFormat: format }),
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Conversion failed')
    },
  })

  const schemas = [
    toolSchema('PDF to JPG Converter', 'Convert PDF pages to JPG or PNG images online for free.', '/pdf-to-jpg'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'PDF to JPG', url: '/pdf-to-jpg' }]),
  ]

  return (
    <>
      <SEOHead
        title="PDF to JPG Converter Online Free - Convert PDF to Image"
        description="Convert PDF pages to JPG or PNG images online for free. High quality conversion. No registration required. Fast and secure."
        canonical="/pdf-to-jpg"
        keywords="PDF to JPG, convert PDF to image, PDF to PNG, PDF to JPG online free"
        schema={schemas}
      />
      <ToolPageLayout
        title="PDF to JPG"
        description="Convert PDF pages to high-quality JPG or PNG images."
        icon={<Image className="w-7 h-7 text-pink-600" />}
        iconBg="bg-pink-50"
        faqs={faqs}
        breadcrumb={[{ label: 'PDF to JPG' }]}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <FileDropzone
            onFilesAdded={addFiles}
            files={files}
            onRemoveFile={removeFile}
            multiple={false}
            maxFiles={1}
            label="Drop a PDF file here or click to browse"
            sublabel="Upload the PDF to convert — up to 50MB"
          />

          {readyFiles.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Output Format</label>
                <div className="flex gap-3">
                  {(['jpg', 'png'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={clsx(
                        'px-6 py-2.5 rounded-xl border-2 text-sm font-semibold uppercase transition-all',
                        format === f
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => convertMutation.mutate()}
                  disabled={isUploading || convertMutation.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Image className="w-4 h-4" />
                  Convert to {format.toUpperCase()}
                </button>
              </div>
            </>
          )}
        </div>
      </ToolPageLayout>

      <ProcessingModal
        isOpen={modalOpen}
        stage={convertMutation.isPending ? 'processing' : result ? 'done' : 'error'}
        progress={convertMutation.isPending ? 60 : 100}
        message={convertMutation.error instanceof Error ? convertMutation.error.message : undefined}
        fileName={result?.fileName}
        onDownload={() => result && download(result.downloadId, result.fileName)}
        onClose={() => { setModalOpen(false); setResult(null) }}
        isDownloading={isDownloading}
      />
    </>
  )
}
