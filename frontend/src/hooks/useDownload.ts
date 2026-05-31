import { useState } from 'react'
import { downloadFile, triggerDownload } from '@/services/api'

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const download = async (downloadId: string, fileName: string) => {
    setIsDownloading(true)
    setError(null)
    try {
      const blob = await downloadFile(downloadId)
      triggerDownload(blob, fileName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setIsDownloading(false)
    }
  }

  return { download, isDownloading, error }
}
