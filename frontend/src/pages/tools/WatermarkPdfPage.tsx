import { useState } from 'react'
import { Droplets } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import ToolPageLayout from '@/components/tools/ToolPageLayout'
import FileDropzone from '@/components/common/FileDropzone'
import ProcessingModal from '@/components/common/ProcessingModal'
import SEOHead from '@/components/seo/SEOHead'
import { faqSchema, toolSchema, breadcrumbSchema } from '@/components/seo/schemas'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDownload } from '@/hooks/useDownload'
import { watermarkPdf } from '@/services/api'
import type { ProcessResponse, WatermarkPosition } from '@/types'
import { clsx } from 'clsx'

interface WatermarkForm {
  text: string
  fontSize: number
  opacity: number
  rotation: number
  position: WatermarkPosition
}

const positions: { value: WatermarkPosition; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'topLeft', label: 'Top Left' },
  { value: 'topRight', label: 'Top Right' },
  { value: 'topCenter', label: 'Top Center' },
  { value: 'bottomLeft', label: 'Bottom Left' },
  { value: 'bottomRight', label: 'Bottom Right' },
  { value: 'bottomCenter', label: 'Bottom Center' },
]

const faqs = [
  {
    question: 'Can I add a text watermark to my PDF?',
    answer: 'Yes, you can add custom text watermarks with control over font size, opacity, rotation, and position.',
  },
  {
    question: 'Can I add an image watermark?',
    answer: 'Yes, you can upload a PNG or JPG image to use as a watermark with control over opacity, position, and scaling.',
  },
  {
    question: 'Will the watermark affect the original content?',
    answer: 'The watermark is added as a layer on top of the existing content. The original text and images remain intact.',
  },
]

export default function WatermarkPdfPage() {
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text')
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { download, isDownloading } = useDownload()
  const { register, handleSubmit, watch } = useForm<WatermarkForm>({
    defaultValues: { fontSize: 48, opacity: 30, rotation: 45, position: 'center', text: 'CONFIDENTIAL' },
  })

  const { files, addFiles, removeFile, readyFiles, isUploading } = useFileUpload({
    maxFiles: 1,
    onError: (err) => alert(err),
  })

  const watermarkMutation = useMutation({
    mutationFn: (data: WatermarkForm) => watermarkPdf({
      fileId: readyFiles[0].fileId!,
      watermarkType,
      text: data.text,
      fontSize: data.fontSize,
      opacity: data.opacity / 100,
      rotation: data.rotation,
      position: data.position,
    }),
    onMutate: () => setModalOpen(true),
    onSuccess: (data) => setResult(data),
    onError: (err) => {
      setResult(null)
      alert(err instanceof Error ? err.message : 'Watermark failed')
    },
  })

  const watchedText = watch('text')
  const watchedOpacity = watch('opacity')
  const watchedRotation = watch('rotation')

  const schemas = [
    toolSchema('Watermark PDF Online', 'Add text or image watermarks to PDF files online for free.', '/watermark-pdf'),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Watermark PDF', url: '/watermark-pdf' }]),
  ]

  return (
    <>
      <SEOHead
        title="Watermark PDF Online Free - Add Text or Image Watermark"
        description="Add text or image watermarks to PDF files online for free. Customize opacity, rotation, and position. No registration required."
        canonical="/watermark-pdf"
        keywords="watermark PDF, add watermark to PDF, PDF watermark online free, text watermark PDF"
        schema={schemas}
      />
      <ToolPageLayout
        title="Watermark PDF"
        description="Add text or image watermarks to your PDF with full customization."
        icon={<Droplets className="w-7 h-7 text-cyan-600" />}
        iconBg="bg-cyan-50"
        faqs={faqs}
        breadcrumb={[{ label: 'Watermark PDF' }]}
      >
        <form onSubmit={handleSubmit((data) => watermarkMutation.mutate(data))}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <FileDropzone
              onFilesAdded={addFiles}
              files={files}
              onRemoveFile={removeFile}
              multiple={false}
              maxFiles={1}
              label="Drop a PDF file here or click to browse"
              sublabel="Upload the PDF to watermark — up to 50MB"
            />

            {readyFiles.length > 0 && (
              <>
                {/* Watermark Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Watermark Type</label>
                  <div className="flex gap-3">
                    {(['text', 'image'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setWatermarkType(type)}
                        className={clsx(
                          'px-5 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all',
                          watermarkType === type
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {type} Watermark
                      </button>
                    ))}
                  </div>
                </div>

                {watermarkType === 'text' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label>
                      <input
                        {...register('text')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="e.g. CONFIDENTIAL, DRAFT"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Font Size: {watch('fontSize')}px
                      </label>
                      <input {...register('fontSize', { valueAsNumber: true })} type="range" min={12} max={120} className="w-full accent-cyan-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opacity: {watchedOpacity}%
                      </label>
                      <input {...register('opacity', { valueAsNumber: true })} type="range" min={5} max={100} className="w-full accent-cyan-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rotation: {watchedRotation}°
                      </label>
                      <input {...register('rotation', { valueAsNumber: true })} type="range" min={-180} max={180} className="w-full accent-cyan-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <select
                        {...register('position')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {positions.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Preview */}
                {watermarkType === 'text' && watchedText && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    <div className="relative h-32 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                      <span
                        className="text-gray-400 font-bold select-none pointer-events-none"
                        style={{
                          fontSize: `${Math.min(watch('fontSize'), 48)}px`,
                          opacity: watchedOpacity / 100,
                          transform: `rotate(${watchedRotation}deg)`,
                        }}
                      >
                        {watchedText}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUploading || watermarkMutation.isPending}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Droplets className="w-4 h-4" />
                    Add Watermark
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </ToolPageLayout>

      <ProcessingModal
        isOpen={modalOpen}
        stage={watermarkMutation.isPending ? 'processing' : result ? 'done' : 'error'}
        progress={watermarkMutation.isPending ? 60 : 100}
        message={watermarkMutation.error instanceof Error ? watermarkMutation.error.message : undefined}
        fileName={result?.fileName}
        onDownload={() => result && download(result.downloadId, result.fileName)}
        onClose={() => { setModalOpen(false); setResult(null) }}
        isDownloading={isDownloading}
      />
    </>
  )
}
