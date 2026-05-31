import { useState } from 'react'
import { FileEdit, Type, Square, Circle, Minus, Highlighter, Underline, MessageSquare } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { editPdf } from '@/services/api'
import type { ProcessResponse, EditOperation } from '@/types'
import { clsx } from 'clsx'

type EditTool = 'text' | 'rectangle' | 'circle' | 'line' | 'highlight' | 'underline' | 'strikethrough' | 'comment'

const editTools = [
  { id: 'text' as EditTool, label: 'Add Text', icon: Type },
  { id: 'rectangle' as EditTool, label: 'Rectangle', icon: Square },
  { id: 'circle' as EditTool, label: 'Circle', icon: Circle },
  { id: 'line' as EditTool, label: 'Line', icon: Minus },
  { id: 'highlight' as EditTool, label: 'Highlight', icon: Highlighter },
  { id: 'underline' as EditTool, label: 'Underline', icon: Underline },
  { id: 'comment' as EditTool, label: 'Comment', icon: MessageSquare },
]

const faqs = [
  {
    question: 'What editing tools are available?',
    answer: 'You can add text, shapes (rectangles, circles, lines), highlights, underlines, strikethroughs, and comments to your PDF.',
  },
  {
    question: 'Can I edit existing text in a PDF?',
    answer: 'You can add new text annotations on top of existing content. Full text editing depends on whether the PDF has editable text layers.',
  },
  {
    question: 'Will my edits be permanent?',
    answer: 'Yes, the edits are embedded into the PDF. The original file is not modified — a new edited PDF is created for download.',
  },
]

export default function EditPdfPage() {
  const [activeTool, setActiveTool] = useState<EditTool>('text')
  const [operations, setOperations] = useState<EditOperation[]>([])
  const [textInput, setTextInput] = useState('')
  const [color, setColor] = useState('#2563EB')
  const [fontSize, setFontSize] = useState(14)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { download, isDownloading } = useDownload()

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    maxFiles: 1,
    onError: (err) => alert(err),
  })

  const addOperation = () => {
    if (!textInput && activeTool === 'text') return
    const op: EditOperation = {
      type: activeTool === 'text' ? 'addText'
        : activeTool === 'rectangle' ? 'addShape'
        : activeTool === 'circle' ? 'addShape'
        : activeTool === 'highlight' ? 'highlight'
        : activeTool === 'underline' ? 'underline'
        : activeTool === 'comment' ? 'addComment'
        : 'addShape',
      page,
      x: 100,
      y: 100,
      text: textInput || undefined,
      fontSize,
      color,
      shapeType: activeTool === 'rectangle' ? 'rectangle'
        : activeTool === 'circle' ? 'circle'
        : activeTool === 'line' ? 'line'
        : undefined,
    }
    setOperations(prev => [...prev, op])
    setTextInput('')
  }

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
        description="Edit PDF files online for free. Add text, shapes, highlights, underlines, and comments. No registration required. Fast and secure PDF editor."
        canonical="/edit-pdf"
        keywords="edit PDF online, PDF editor free, add text to PDF, annotate PDF, PDF annotation tool"
        schema={schemas}
      />
      <ToolPageLayout
        title="Edit PDF"
        description="Add text, shapes, highlights, and annotations to your PDF documents."
        icon={<FileEdit className="w-7 h-7 text-blue-600" />}
        iconBg="bg-blue-50"
        faqs={faqs}
        breadcrumb={[{ label: 'Edit PDF' }]}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <FileDropzone
            onFilesAdded={addFiles}
            files={files}
            onRemoveFile={removeFile}
            multiple={false}
            maxFiles={1}
            label="Drop a PDF file here or click to browse"
            sublabel="Upload the PDF you want to edit — up to 50MB"
          />

          {readyFiles.length > 0 && (
            <>
              {/* Toolbar */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Editing Tools</label>
                <div className="flex flex-wrap gap-2">
                  {editTools.map(tool => {
                    const Icon = tool.icon
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveTool(tool.id)}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                          activeTool === tool.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {tool.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tool Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeTool === 'text' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
                    <input
                      type="text"
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      placeholder="Enter text to add..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">{color}</span>
                  </div>
                </div>
                {activeTool === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size: {fontSize}px</label>
                    <input
                      type="range"
                      min={8}
                      max={72}
                      value={fontSize}
                      onChange={e => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                  <input
                    type="number"
                    min={1}
                    value={page}
                    onChange={e => setPage(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addOperation}
                className="btn-secondary text-sm"
              >
                + Add to Queue
              </button>

              {/* Operations Queue */}
              {operations.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pending Operations ({operations.length})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {operations.map((op, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                        <span className="text-gray-700">
                          <span className="font-medium capitalize">{op.type}</span>
                          {op.text && ` — "${op.text}"`}
                          {` on page ${op.page}`}
                        </span>
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
                  onClick={() => editMutation.mutate()}
                  disabled={operations.length === 0 || isUploading || editMutation.isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FileEdit className="w-4 h-4" />
                  Apply Edits & Download
                </button>
              </div>
            </>
          )}
        </div>
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
