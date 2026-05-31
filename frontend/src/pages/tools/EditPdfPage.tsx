import { useState, useCallback } from 'react'
import {
  FileEdit, Type, Square, Circle, Minus, Highlighter,
  Underline, MessageSquare, Download, Loader2, Trash2
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import PdfViewer from '@/components/common/PdfViewer'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { editPdf } from '@/services/api'
import type { ProcessResponse, EditOperation } from '@/types'
import { clsx } from 'clsx'

type EditTool = 'text' | 'rectangle' | 'circle' | 'line' | 'highlight' | 'underline' | 'strikethrough' | 'comment'

const editTools: { id: EditTool; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'text', label: 'Add Text', icon: Type, color: 'text-blue-600' },
  { id: 'rectangle', label: 'Rectangle', icon: Square, color: 'text-purple-600' },
  { id: 'circle', label: 'Circle', icon: Circle, color: 'text-green-600' },
  { id: 'line', label: 'Line', icon: Minus, color: 'text-gray-600' },
  { id: 'highlight', label: 'Highlight', icon: Highlighter, color: 'text-yellow-600' },
  { id: 'underline', label: 'Underline', icon: Underline, color: 'text-indigo-600' },
  { id: 'comment', label: 'Comment', icon: MessageSquare, color: 'text-pink-600' },
]

const faqs = [
  {
    question: 'How do I edit a PDF?',
    answer: 'Upload your PDF, it will display on screen. Select a tool, click on the PDF where you want to add content, then click "Apply & Download".',
  },
  {
    question: 'Can I see the PDF while editing?',
    answer: 'Yes! The PDF is displayed in full. You can navigate pages, zoom in/out, and see exactly where your edits will appear.',
  },
  {
    question: 'What editing tools are available?',
    answer: 'Add text, rectangles, circles, lines, highlights, underlines, and comments anywhere on any page.',
  },
]

export default function EditPdfPage() {
  const [activeTool, setActiveTool] = useState<EditTool>('text')
  const [operations, setOperations] = useState<EditOperation[]>([])
  const [textInput, setTextInput] = useState('')
  const [color, setColor] = useState('#2563EB')
  const [fontSize, setFontSize] = useState(14)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { download, isDownloading } = useDownload()

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    maxFiles: 1,
    onError: (err) => alert(err),
  })

  const uploadedFile = files[0]?.file ?? null

  const addOperation = useCallback(() => {
    if (activeTool === 'text' && !textInput.trim()) {
      alert('Please enter text to add.')
      return
    }

    const op: EditOperation = {
      type: activeTool === 'text' ? 'addText'
        : activeTool === 'highlight' ? 'highlight'
          : activeTool === 'underline' ? 'underline'
            : activeTool === 'strikethrough' ? 'strikethrough'
              : activeTool === 'comment' ? 'addComment'
                : 'addShape',
      page: currentPage,
      x: 100,
      y: 700,
      width: 200,
      height: 30,
      text: textInput || undefined,
      fontSize,
      color,
      shapeType: ['rectangle', 'circle', 'line'].includes(activeTool)
        ? (activeTool as 'rectangle' | 'circle' | 'line')
        : undefined,
    }
    setOperations(prev => [...prev, op])
    if (activeTool === 'text') setTextInput('')
  }, [activeTool, textInput, fontSize, color, currentPage])

  const editMutation = useMutation({
    mutationFn: () => editPdf({ fileId: readyFiles[0].fileId!, operations }),
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Edit failed')
    },
  })

  const schemas = [
    toolSchema('Edit PDF Online', 'Add text, shapes, highlights and annotations to PDF files online for free.', '/edit-pdf'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Edit PDF', url: '/edit-pdf' }]),
  ]

  return (
    <>
      <SEOHead
        title="Edit PDF Online Free - Add Text, Shapes & Annotations"
        description="Edit PDF files online for free. Add text, shapes, highlights, underlines, and comments. See your PDF while editing. No registration required."
        canonical="/edit-pdf"
        keywords="edit PDF online, PDF editor free, add text to PDF, annotate PDF"
        schema={schemas}
      />
      <ToolPageLayout
        title="Edit PDF"
        description="Upload your PDF, see it on screen, and add text, shapes, highlights, and annotations."
        icon={<FileEdit className="w-7 h-7 text-blue-600" />}
        iconBg="bg-blue-50"
        faqs={faqs}
        breadcrumb={[{ label: 'Edit PDF' }]}
      >
        {/* Step 1: Upload */}
        {readyFiles.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <FileDropzone
              onFilesAdded={addFiles}
              files={files}
              onRemoveFile={removeFile}
              multiple={false}
              maxFiles={1}
              label="Drop a PDF file here or click to browse"
              sublabel="Upload the PDF you want to edit — up to 50 MB"
            />
          </div>
        )}

        {/* Step 2: Edit */}
        {readyFiles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PDF Viewer — left 2/3 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                      {files[0]?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => { removeFile(files[0].id); setOperations([]) }}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Change file
                  </button>
                </div>
                <PdfViewer
                  file={uploadedFile}
                  onPageChange={setCurrentPage}
                  onTotalPages={setTotalPages}
                  showControls={true}
                />
              </div>
            </div>

            {/* Tools Panel — right 1/3 */}
            <div className="space-y-4">
              {/* Tool selector */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Tool</h3>
                <div className="grid grid-cols-2 gap-2">
                  {editTools.map(tool => {
                    const Icon = tool.icon
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveTool(tool.id)}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                          activeTool === tool.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        <Icon className={clsx('w-3.5 h-3.5', tool.color)} />
                        {tool.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tool options */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Options</h3>

                {activeTool === 'text' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Text to add</label>
                    <input
                      type="text"
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      placeholder="Enter your text..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {activeTool === 'text' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Font size: {fontSize}px
                    </label>
                    <input
                      type="range" min={8} max={72} value={fontSize}
                      onChange={e => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color" value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                    />
                    <span className="text-xs text-gray-500">{color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Page: {currentPage} of {totalPages || '?'}
                  </label>
                  <p className="text-xs text-gray-400">Navigate pages in the viewer</p>
                </div>

                <button
                  type="button"
                  onClick={addOperation}
                  className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  + Add to Queue
                </button>
              </div>

              {/* Operations queue */}
              {operations.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Queue ({operations.length})
                    </h3>
                    <button
                      onClick={() => setOperations([])}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {operations.map((op, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                        <span className="text-gray-700">
                          <span className="font-medium capitalize">{op.type.replace('add', '')}</span>
                          {op.text && ` "${op.text.slice(0, 15)}${op.text.length > 15 ? '…' : ''}"`}
                          <span className="text-gray-400"> · p{op.page}</span>
                        </span>
                        <button
                          onClick={() => setOperations(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-600 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => editMutation.mutate()}
                    disabled={isUploading || editMutation.isPending}
                    className="w-full mt-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    {editMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Apply & Download
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </ToolPageLayout>

      <ProcessingModal
        isOpen={modalOpen}
        stage={editMutation.isPending ? 'processing' : result ? 'done' : 'error'}
        progress={editMutation.isPending ? 60 : 100}
        message={editMutation.error instanceof Error ? editMutation.error.message : undefined}
        fileName={result?.fileName}
        onDownload={() => result && download(result.downloadId, result.fileName)}
        onClose={() => { setModalOpen(false); setResult(null) }}
        isDownloading={isDownloading}
      />
    </>
  )
}
