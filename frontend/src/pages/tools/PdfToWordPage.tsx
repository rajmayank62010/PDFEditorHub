import { useState } from 'react'
import { FileText } from 'lucide-react'
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
    question: 'How accurate is the PDF to Word conversion?',
    answer: 'Our converter maintains the layout, fonts, and formatting as closely as possible. Complex layouts may require minor adjustments after conversion.',
  },
  {
    question: 'What Word format is the output?',
    answer: 'The output is a .docx file compatible with Microsoft Word, Google Docs, LibreOffice, and other word processors.',
  },
  {
    question: 'Can I convert scanned PDFs to Word?',
    answer: 'Scanned PDFs require OCR (Optical Character Recognition). Our tool works best with text-based PDFs.',
  },
]

export default function PdfToWordPage() {
  const [format, setFormat] = useState<'docx' | 'txt'>('docx')
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
    toolSchema('PDF to Word Converter', 'Convert PDF files to Word DOCX documents online for free.', '/pdf-to-word'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'PDF to Word', url: '/pdf-to-word' }]),
  ]

  return (
    <>
      <SEOHead
        title="PDF to Word Converter Online Free - Convert PDF to DOCX"
        description="Convert PDF files to Word documents (DOCX) online for free. Maintain formatting and layout. No registration required."
        canonical="/pdf-to-word"
        keywords="PDF to Word, convert PDF to DOCX, PDF to Word online free, PDF converter"
        schema={schemas}
      />
      <ToolPageLayout
        title="PDF to Word"
        description="Convert PDF documents to editable Word files while preserving formatting."
        icon={<FileText className="w-7 h-7 text-blue-700" />}
        iconBg="bg-blue-50"
        faqs={faqs}
        breadcrumb={[{ label: 'PDF to Word' }]}
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
                  {([
                    { value: 'docx', label: 'Word (.docx)', desc: 'Editable Word document' },
                    { value: 'txt', label: 'Plain Text (.txt)', desc: 'Simple text extraction' },
                  ] as const).map(f => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormat(f.value)}
                      className={clsx(
                        'px-5 py-3 rounded-xl border-2 text-left transition-all',
                        format === f.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <p className={clsx('font-semibold text-sm', format === f.value ? 'text-blue-700' : 'text-gray-700')}>
                        {f.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
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
                  <FileText className="w-4 h-4" />
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
