import { useState } from 'react'
import { Scissors } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import PdfViewer from '@/components/common/PdfViewer'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { splitPdf } from '@/services/api'
import type { ProcessResponse, SplitRequest } from '@/types'
import { clsx } from 'clsx'

type SplitMode = 'byRange' | 'allPages' | 'extractPages'

interface SplitForm {
  pageRanges: string
  pages: string
}

const faqs = [
  {
    question: 'How do I split a PDF?',
    answer: 'Upload your PDF, it will display on screen so you can see the pages. Choose a split mode, configure options, and click Split PDF.',
  },
  {
    question: 'What does "Split by page range" mean?',
    answer: 'Specify page ranges like "1-3, 5, 7-9" to extract those specific pages into a new PDF.',
  },
  {
    question: 'Can I extract individual pages?',
    answer: 'Yes, use "Extract Pages" mode and specify which page numbers you want.',
  },
]

export default function SplitPdfPage() {
  const [splitMode, setSplitMode] = useState<SplitMode>('byRange')
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const { download, isDownloading } = useDownload()
  const { register, handleSubmit } = useForm<SplitForm>()

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    maxFiles: 1,
    onError: (err) => alert(err),
  })

  const splitMutation = useMutation({
    mutationFn: (req: SplitRequest) => splitPdf(req),
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Split failed')
    },
  })

  const onSubmit = (data: SplitForm) => {
    if (!readyFiles[0]?.fileId) return
    splitMutation.mutate({
      fileId: readyFiles[0].fileId,
      splitMode,
      pageRanges: splitMode === 'byRange' ? data.pageRanges : undefined,
      pages: splitMode === 'extractPages'
        ? data.pages.split(',').map(p => parseInt(p.trim())).filter(Boolean)
        : undefined,
    })
  }

  const schemas = [
    toolSchema('Split PDF Online', 'Split PDF files by page ranges or extract specific pages online for free.', '/split-pdf'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Split PDF', url: '/split-pdf' }]),
  ]

  return (
    <>
      <SEOHead
        title="Split PDF Online Free - Split PDF by Pages"
        description="Split PDF files by page ranges, extract specific pages, or split into individual pages. Free online PDF splitter. No registration required."
        canonical="/split-pdf"
        keywords="split PDF, split PDF online, extract pages from PDF, PDF splitter free"
        schema={schemas}
      />
      <ToolPageLayout
        title="Split PDF"
        description="Preview your PDF, then split it by page ranges or extract specific pages."
        icon={<Scissors className="w-7 h-7 text-orange-600" />}
        iconBg="bg-orange-50"
        faqs={faqs}
        breadcrumb={[{ label: 'Split PDF' }]}
      >
        {readyFiles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <FileDropzone
              onFilesAdded={addFiles}
              files={files}
              onRemoveFile={removeFile}
              multiple={false}
              maxFiles={1}
              label="Drop a PDF file here or click to browse"
              sublabel="Upload one PDF to split — up to 50 MB"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PDF Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 truncate">{files[0]?.name}</span>
                {totalPages > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {totalPages} pages
                  </span>
                )}
              </div>
              <PdfViewer
                file={files[0]?.file ?? null}
                onTotalPages={setTotalPages}
                showControls={true}
              />
            </div>

            {/* Split Options */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Split Mode</label>
                  <div className="space-y-2">
                    {([
                      { value: 'byRange', label: 'By Page Range', desc: 'e.g. 1-3, 5, 7-9' },
                      { value: 'allPages', label: 'All Pages', desc: 'One PDF per page (ZIP)' },
                      { value: 'extractPages', label: 'Extract Pages', desc: 'Pick specific pages' },
                    ] as const).map(mode => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setSplitMode(mode.value)}
                        className={clsx(
                          'w-full p-3 rounded-xl border-2 text-left transition-all',
                          splitMode === mode.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <p className={clsx('font-medium text-sm', splitMode === mode.value ? 'text-orange-700' : 'text-gray-900')}>
                          {mode.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {splitMode === 'byRange' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Page Ranges</label>
                    <input
                      {...register('pageRanges', { required: true })}
                      type="text"
                      placeholder="e.g. 1-3, 5, 7-9"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {totalPages > 0 ? `This PDF has ${totalPages} pages.` : ''} Use commas to separate ranges.
                    </p>
                  </div>
                )}

                {splitMode === 'extractPages' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Page Numbers</label>
                    <input
                      {...register('pages', { required: true })}
                      type="text"
                      placeholder="e.g. 1, 3, 5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Enter page numbers separated by commas.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading || splitMutation.isPending}
                  className="w-full py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  <Scissors className="w-4 h-4" />
                  Split PDF
                </button>
              </div>
            </form>
          </div>
        )}
      </ToolPageLayout>

      <ProcessingModal
        isOpen={modalOpen}
        stage={splitMutation.isPending ? 'processing' : result ? 'done' : 'error'}
        progress={splitMutation.isPending ? 60 : 100}
        message={splitMutation.error instanceof Error ? splitMutation.error.message : undefined}
        fileName={result?.fileName}
        onDownload={() => result && download(result.downloadId, result.fileName)}
        onClose={() => { setModalOpen(false); setResult(null) }}
        isDownloading={isDownloading}
      />
    </>
  )
}
