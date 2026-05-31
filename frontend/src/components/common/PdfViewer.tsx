import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Use local worker from pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString()

interface PdfViewerProps {
    file: File | string | null
    onPageChange?: (page: number) => void
    onTotalPages?: (total: number) => void
    className?: string
    showControls?: boolean
}

export default function PdfViewer({
    file,
    onPageChange,
    onTotalPages,
    className = '',
    showControls = true,
}: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0)
    const [pageNumber, setPageNumber] = useState(1)
    const [scale, setScale] = useState(1.0)
    const [rotation, setRotation] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setPageNumber(1)
        setLoading(true)
        setError(null)
    }, [file])

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
        setLoading(false)
        onTotalPages?.(numPages)
    }

    function onDocumentLoadError(err: Error) {
        setError('Could not load PDF. Please try again.')
        setLoading(false)
        console.error('PDF load error:', err)
    }

    function goToPrevPage() {
        const p = Math.max(1, pageNumber - 1)
        setPageNumber(p)
        onPageChange?.(p)
    }

    function goToNextPage() {
        const p = Math.min(numPages, pageNumber + 1)
        setPageNumber(p)
        onPageChange?.(p)
    }

    function zoomIn() { setScale(s => Math.min(3, s + 0.25)) }
    function zoomOut() { setScale(s => Math.max(0.5, s - 0.25)) }
    function rotate() { setRotation(r => (r + 90) % 360) }

    if (!file) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 rounded-xl h-64 ${className}`}>
                <p className="text-gray-400 text-sm">No PDF loaded</p>
            </div>
        )
    }

    return (
        <div className={`flex flex-col ${className}`}>
            {/* Controls */}
            {showControls && (
                <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-xl text-sm">
                    {/* Page navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToPrevPage}
                            disabled={pageNumber <= 1}
                            className="p-1 rounded hover:bg-gray-700 disabled:opacity-40 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="min-w-[80px] text-center">
                            {loading ? '...' : `${pageNumber} / ${numPages}`}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={pageNumber >= numPages}
                            className="p-1 rounded hover:bg-gray-700 disabled:opacity-40 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Zoom + Rotate */}
                    <div className="flex items-center gap-2">
                        <button onClick={zoomOut} className="p-1 rounded hover:bg-gray-700 transition-colors">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="min-w-[48px] text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={zoomIn} className="p-1 rounded hover:bg-gray-700 transition-colors">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button onClick={rotate} className="p-1 rounded hover:bg-gray-700 transition-colors ml-2">
                            <RotateCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* PDF Canvas */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-gray-200 flex justify-center p-4 rounded-b-xl"
                style={{ minHeight: '500px', maxHeight: '70vh' }}
            >
                {error ? (
                    <div className="flex items-center justify-center text-red-500 text-sm">
                        {error}
                    </div>
                ) : (
                    <Document
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="flex items-center justify-center h-64">
                                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                            </div>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            rotate={rotation}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="shadow-xl"
                        />
                    </Document>
                )}
            </div>
        </div>
    )
}
