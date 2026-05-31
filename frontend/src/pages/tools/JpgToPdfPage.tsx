import { useState } from 'react'
import { FileImage, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { convertPdf, mergePdfs } from '@/services/api'
import type { ProcessResponse } from '@/types'

const faqs = [
  {
    question: 'How do I convert JPG to PDF?',
    answer:
      'Upload one or more JPG or PNG images, arrange them in the desired order, and click Convert to PDF. All images will be combined into a single PDF.',
  },
  {
    question: 'Can I convert multiple images to one PDF?',
    answer:
      'Yes — upload multiple images and they will all be combined into a single PDF document, one image per page.',
  },
  {
    question: 'What image formats are supported?',
    answer: 'We support JPG, JPEG, and PNG image formats for conversion to PDF.',
  },
]

export default function JpgToPdfPage() {
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { download, isDownloading } = useDownload()

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    accept: ['image/jpeg', 'image/png', 'image/jpg'],
    maxFiles: 20,
    onError: (err) => alert(err),
  })

  const convertMutation = useMutation({
    mutationFn: async () => {
      if (readyFiles.length === 1) {
        // Single image → convert directly
        return convertPdf({ fileId: readyFiles[0].fileId!, outputFormat: 'pdf' })
      }

      // Multiple images: convert each to PDF then merge
      const singlePdfs = await Promise.all(
        readyFiles.map((f) => convertPdf({ fileId: f.fileId!, outputFormat: 'pdf' })),
      )
      return mergePdfs({ fileIds: singlePdfs.map((r) => r.downloadId) })
    },
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Conversion failed')
    },
  })

  const schemas = [
    toolSchema('JPG to PDF Converter', 'Convert JPG and PNG images to PDF online for free.', '/jpg-to-pdf'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'JPG to PDF', url: '/jpg-to-pdf' }]),
  ]

  return (
    <>
      <SEOHead
        title="JPG to PDF Converter Online Free - Convert Images to PDF"
        description="Convert JPG, PNG images to PDF online for free. Combine multiple images into one PDF. No registration required. Fast and secure."
        canonical="/jpg-to-pdf"
        keywords="JPG to PDF, convert image to PDF, PNG to PDF, image to PDF online free"
        schema={schemas}
      />
      <ToolPageLayout
        title="JPG to PDF"
        description="Convert JPG and PNG images to PDF documents. Combine multiple images into one PDF."
        icon={<FileImage className="w-7 h-7 text-rose-600" />}
        iconBg="bg-rose-50"
        faqs={faqs}
        breadcrumb={[{ label: 'JPG to PDF' }]}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <FileDropzone
            onFilesAdded={addFiles}
            files={files}
            onRemoveFile={removeFile}
            multiple={true}
            maxFiles={20}
            accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
            label="Drop image files here or click to browse"
            sublabel="Supports JPG and PNG — up to 20 images, 50 MB each"
          />

          {readyFiles.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {readyFiles.length} image{readyFiles.length > 1 ? 's' : ''} ready
                {readyFiles.length > 1 && ' — will be combined into one PDF'}
              </p>
              <button
                onClick={() => convertMutation.mutate()}
                disabled={isUploading || convertMutation.isPending}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {convertMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileImage className="w-4 h-4" />
                )}
                Convert {readyFiles.length} Image{readyFiles.length > 1 ? 's' : ''} to PDF
              </button>
            </div>
          )}
        </div>
      </ToolPageLayout>

      <ProcessingModal
        isOpen={modalOpen}
        stage={convertMutation.isPending ? 'processing' : result ? 'done' : 'error'}
        progress={convertMutation.isPending ? 60 : 100}
        message={
          convertMutation.error instanceof Error ? convertMutation.error.message : undefined
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
