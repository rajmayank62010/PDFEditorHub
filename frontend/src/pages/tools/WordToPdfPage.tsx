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

const faqs = [
  {
    question: 'How do I convert Word to PDF?',
    answer: 'Upload your .docx or .doc file and click Convert. The Word document will be converted to a PDF while preserving formatting.',
  },
  {
    question: 'Will the formatting be preserved?',
    answer: 'Yes, fonts, images, tables, and layout are preserved as closely as possible in the converted PDF.',
  },
  {
    question: 'What Word formats are supported?',
    answer: 'We support .docx and .doc formats from Microsoft Word.',
  },
]

export default function WordToPdfPage() {
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { download, isDownloading } = useDownload()

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    accept: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
    maxFiles: 1,
    onError: (err) => alert(err),
  })

  const convertMutation = useMutation({
    mutationFn: () => convertPdf({ fileId: readyFiles[0].fileId!, outputFormat: 'pdf' }),
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Conversion failed')
    },
  })

  const schemas = [
    toolSchema('Word to PDF Converter', 'Convert Word DOCX documents to PDF online for free.', '/word-to-pdf'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Word to PDF', url: '/word-to-pdf' }]),
  ]

  return (
    <>
      <SEOHead
        title="Word to PDF Converter Online Free - Convert DOCX to PDF"
        description="Convert Word documents to PDF online for free. Preserve formatting and layout. No registration required. Fast and secure."
        canonical="/word-to-pdf"
        keywords="Word to PDF, convert DOCX to PDF, Word to PDF online free, document converter"
        schema={schemas}
      />
      <ToolPageLayout
        title="Word to PDF"
        description="Convert Word documents to PDF while preserving all formatting and layout."
        icon={<FileText className="w-7 h-7 text-indigo-700" />}
        iconBg="bg-indigo-50"
        faqs={faqs}
        breadcrumb={[{ label: 'Word to PDF' }]}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <FileDropzone
            onFilesAdded={addFiles}
            files={files}
            onRemoveFile={removeFile}
            multiple={false}
            maxFiles={1}
            accept={{
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'application/msword': ['.doc'],
            }}
            label="Drop a Word file here or click to browse"
            sublabel="Supports .docx and .doc files — up to 50MB"
          />

          {readyFiles.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => convertMutation.mutate()}
                disabled={isUploading || convertMutation.isPending}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Convert to PDF
              </button>
            </div>
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
