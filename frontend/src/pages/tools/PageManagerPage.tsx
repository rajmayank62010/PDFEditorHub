import { useState } from 'react'
import { LayoutGrid, RotateCw, Trash2, Copy, ArrowUpDown } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { managePages } from '@/services/api'
import type { ProcessResponse, PageOperation } from '@/types'
import { clsx } from 'clsx'

type PageAction = 'rotate' | 'delete' | 'duplicate'

const faqs = [
  {
    question: 'What page operations are supported?',
    answer: 'You can rotate pages (90°, 180°, 270°), delete pages, duplicate pages, and reorder pages.',
  },
  {
    question: 'Can I rotate individual pages?',
    answer: 'Yes, you can rotate any specific page by 90, 180, or 270 degrees.',
  },
  {
    question: 'Can I delete multiple pages at once?',
    answer: 'Yes, you can add multiple delete operations to the queue and apply them all at once.',
  },
]

export default function PageManagerPage() {
  const [operations, setOperations] = useState<PageOperation[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [action, setAction] = useState<PageAction>('rotate')
  const [rotation, setRotation] = useState<90 | 180 | 270>(90)
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { download, isDownloading } = useDownload()

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    maxFiles: 1,
    onError: (err) => alert(err),
  })

  const addOp = () => {
    const op: PageOperation = {
      type: action,
      pageNumber: pageNum,
      rotation: action === 'rotate' ? rotation : undefined,
    }
    setOperations(prev => [...prev, op])
  }

  const manageMutation = useMutation({
    mutationFn: () => managePages({ fileId: readyFiles[0].fileId!, operations }),
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Page management failed')
    },
  })

  const schemas = [
    toolSchema('PDF Page Manager', 'Rotate, delete, duplicate and reorder PDF pages online for free.', '/page-manager'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Page Manager', url: '/page-manager' }]),
  ]

  return (
    <>
      <SEOHead
        title="PDF Page Manager - Rotate, Delete & Reorder PDF Pages"
        description="Manage PDF pages online for free. Rotate, delete, duplicate, and reorder pages. No registration required. Fast and secure."
        canonical="/page-manager"
        keywords="rotate PDF pages, delete PDF pages, reorder PDF pages, PDF page manager"
        schema={schemas}
      />
      <ToolPageLayout
        title="Page Manager"
        description="Rotate, delete, duplicate, and reorder pages in your PDF documents."
        icon={<LayoutGrid className="w-7 h-7 text-violet-600" />}
        iconBg="bg-violet-50"
        faqs={faqs}
        breadcrumb={[{ label: 'Page Manager' }]}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <FileDropzone
            onFilesAdded={addFiles}
            files={files}
            onRemoveFile={removeFile}
            multiple={false}
            maxFiles={1}
            label="Drop a PDF file here or click to browse"
            sublabel="Upload the PDF to manage pages — up to 50MB"
          />

          {readyFiles.length > 0 && (
            <>
              {/* Action Builder */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Add Page Operation</h3>

                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'rotate', label: 'Rotate', icon: RotateCw },
                    { value: 'delete', label: 'Delete', icon: Trash2 },
                    { value: 'duplicate', label: 'Duplicate', icon: Copy },
                  ] as const).map(a => {
                    const Icon = a.icon
                    return (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => setAction(a.value)}
                        className={clsx(
                          'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                          action === a.value
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {a.label}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Page Number</label>
                    <input
                      type="number"
                      min={1}
                      value={pageNum}
                      onChange={e => setPageNum(parseInt(e.target.value) || 1)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {action === 'rotate' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Rotation</label>
                      <select
                        value={rotation}
                        onChange={e => setRotation(parseInt(e.target.value) as 90 | 180 | 270)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <option value={90}>90° Clockwise</option>
                        <option value={180}>180°</option>
                        <option value={270}>270° (90° Counter)</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addOp}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                  >
                    + Add Operation
                  </button>
                </div>
              </div>

              {/* Operations Queue */}
              {operations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Operations Queue ({operations.length})
                    </label>
                    <button
                      onClick={() => setOperations([])}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {operations.map((op, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700">
                            <span className="font-medium capitalize">{op.type}</span>
                            {` page ${op.pageNumber}`}
                            {op.rotation && ` by ${op.rotation}°`}
                          </span>
                        </div>
                        <button
                          onClick={() => setOperations(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => manageMutation.mutate()}
                  disabled={operations.length === 0 || isUploading || manageMutation.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Apply Changes
                </button>
              </div>
            </>
          )}
        </div>
      </ToolPageLayout>

      <ProcessingModal
        isOpen={modalOpen}
        stage={manageMutation.isPending ? 'processing' : result ? 'done' : 'error'}
        progress={manageMutation.isPending ? 60 : 100}
        message={manageMutation.error instanceof Error ? manageMutation.error.message : undefined}
        fileName={result?.fileName}
        onDownload={() => result && download(result.downloadId, result.fileName)}
        onClose={() => { setModalOpen(false); setResult(null) }}
        isDownloading={isDownloading}
      />
    </>
  )
}
