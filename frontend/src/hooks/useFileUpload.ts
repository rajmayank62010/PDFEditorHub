import { useState, useCallback, useMemo } from 'react'
import { uploadFile } from '@/services/api'
import type { UploadedFile } from '@/types'

interface UseFileUploadOptions {
  accept?: string[]
  maxSize?: number
  maxFiles?: number
  onSuccess?: (files: UploadedFile[]) => void
  onError?: (error: string) => void
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024 // 50 MB
const DEFAULT_ACCEPT = ['application/pdf']

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    accept = DEFAULT_ACCEPT,
    maxSize = DEFAULT_MAX_SIZE,
    maxFiles = 10,
    onSuccess,
    onError,
  } = options

  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Memoised so it can safely be included in dependency arrays
  const validateFile = useCallback(
    (file: File): string | null => {
      if (accept.length > 0 && !accept.includes(file.type)) {
        const exts = accept
          .map((t) => t.split('/')[1]?.toUpperCase() ?? t)
          .join(', ')
        return `Invalid file type. Accepted: ${exts}`
      }
      if (file.size > maxSize) {
        return `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)} MB`
      }
      return null
    },
    [accept, maxSize],
  )

  const uploadSingleFile = useCallback(
    async (file: File): Promise<UploadedFile> => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      const pending: UploadedFile = {
        id,
        file,
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
      }

      setFiles((prev) => [...prev, pending])

      try {
        const result = await uploadFile(file, (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, progress } : f)),
          )
        })

        const completed: UploadedFile = {
          ...pending,
          status: 'ready',
          progress: 100,
          fileId: result.fileId,
          pageCount: result.pageCount,
        }

        setFiles((prev) => prev.map((f) => (f.id === id ? completed : f)))
        return completed
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed'
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: 'error', error: errorMsg } : f,
          ),
        )
        throw err
      }
    },
    [], // uploadFile is a stable module-level function
  )

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      if (files.length + newFiles.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed`)
        return
      }

      const validFiles: File[] = []
      for (const file of newFiles) {
        const err = validateFile(file)
        if (err) {
          onError?.(err)
          return
        }
        validFiles.push(file)
      }

      try {
        const uploaded = await Promise.all(validFiles.map(uploadSingleFile))
        onSuccess?.(uploaded)
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Upload failed')
      }
    },
    [files.length, maxFiles, validateFile, uploadSingleFile, onSuccess, onError],
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(Array.from(e.dataTransfer.files))
    },
    [addFiles],
  )

  const readyFiles = useMemo(() => files.filter((f) => f.status === 'ready'), [files])
  const isUploading = useMemo(() => files.some((f) => f.status === 'uploading'), [files])
  const hasErrors = useMemo(() => files.some((f) => f.status === 'error'), [files])

  return {
    files,
    readyFiles,
    isDragging,
    isUploading,
    hasErrors,
    addFiles,
    removeFile,
    clearFiles,
    reorderFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
