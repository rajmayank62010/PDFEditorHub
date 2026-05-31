import { useState } from 'react'
import { GitMerge, GripVertical, Trash2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { mergePdfs } from '@/services/api'
import type { ProcessResponse } from '@/types'

const faqs = [
  {
    question: 'How do I merge PDF files?',
    answer: 'Upload your PDF files, arrange them in the desired order by dragging and dropping, then click "Merge PDFs". Your merged PDF will be ready to download instantly.',
  },
  {
    question: 'How many PDFs can I merge at once?',
    answer: 'You can merge up to 10 PDF files at once. Each file can be up to 50MB in size.',
  },
  {
    question: 'Will the quality be maintained after merging?',
    answer: 'Yes, merging PDFs does not affect the quality of the content. All text, images, and formatting are preserved exactly as in the original files.',
  },
  {
    question: 'Can I rearrange the order of PDFs before merging?',
    answer: 'Yes, you can drag and drop the uploaded files to rearrange them in any order before merging.',
  },
]

export default function MergePdfPage() {
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { download, isDownloading } = useDownload()

  const { files, addFiles, removeFile, isUploading, readyFiles } = useFileUpload({
    maxFiles: 10,
    onError: (err) => alert(err),
  })

  const mergeMutation = useMutation({
    mutationFn: () => mergePdfs({ fileIds: readyFiles.map(f => f.fileId!) }),
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Merge failed')
    },
  })

  const handleDownload = async () => {
    if (!result) return
    await download(result.downloadId, result.fileName)
  }

  const handleClose = () => {
    setModalOpen(false)
    setResult(null)
  }

  const schemas = [
    toolSchema('Merge PDF Online', 'Combine multiple PDF files into one document online for free.', '/merge-pdf'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Merge PDF', url: '/merge-pdf' }]),
  ]

  return (
    <>
      <SEOHead
        title="Merge PDF Online Free - Combine PDF Files"
        description="Merge multiple PDF files into one document online for free. Drag and drop to reorder pages. No registration required. Fast and secure."
        canonical="/merge-pdf"
        keywords="merge PDF, combine PDF, join PDF files, merge PDF online free"
        schema={schemas}
      />
      <ToolPageLayout
        title="Merge PDF Files"
        description="Combine multiple PDF documents into a single file. Drag to reorder before merging."
        icon={<GitMerge className="w-7 h-7 text-purple-600" />}
        iconBg="bg-purple-50"
        faqs={faqs}
        breadcrumb={[{ label: 'Merge PDF' }]}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <FileDropzone
            onFilesAdded={addFiles}
            files={files}
            onRemoveFile={removeFile}
            multiple={true}
            maxFiles={10}
            label="Drop PDF files here or click to browse"
            sublabel="Add multiple PDFs to merge — up to 10 files, 50MB each"
          />

          {/* Reorder list */}
          {files.length > 1 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Drag to reorder files:</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => mergeMutation.mutate()}
              disabled={readyFiles.length < 2 || isUploading || mergeMutation.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <GitMerge className="w-4 h-4" />
              Merge {readyFiles.length > 0 ? `${readyFiles.length} PDFs` : 'PDFs'}
            </button>
          </div>

          {readyFiles.length < 2 && files.length > 0 && (
            <p className="text-sm text-amber-600 mt-2 text-right">
              Please upload at least 2 PDF files to merge.
            </p>
          )}
        </div>
      </ToolPageLayout>

      <ProcessingModal
        isOpen={modalOpen}
        stage={mergeMutation.isPending ? 'processing' : result ? 'done' : 'error'}
        progress={mergeMutation.isPending ? 60 : 100}
        message={mergeMutation.error instanceof Error ? mergeMutation.error.message : undefined}
        fileName={result?.fileName}
        onDownload={handleDownload}
        onClose={handleClose}
        isDownloading={isDownloading}
      />
    </>
  )
}
