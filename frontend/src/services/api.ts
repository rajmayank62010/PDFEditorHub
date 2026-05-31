import axios, { type AxiosProgressEvent } from 'axios'
import type {
  ApiResponse,
  UploadResponse,
  ProcessResponse,
  MergeRequest,
  SplitRequest,
  CompressRequest,
  CompressResponse,
  WatermarkRequest,
  SignRequest,
  ConvertRequest,
  EditRequest,
  PageManageRequest,
  SecurityRequest,
} from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 minutes for large files
  headers: { Accept: 'application/json' },
})

// Normalise error messages from the API
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message: string =
      error.response?.data?.message ??
      error.response?.data?.errors?.[0] ??
      error.message ??
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload any supported file (PDF, image, DOCX).
 * Returns a fileId that is used in all subsequent processing calls.
 */
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<ApiResponse<UploadResponse>>(
    '/pdf/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total))
        }
      },
    },
  )
  return response.data.data
}

/** Alias kept for backwards compatibility with existing tool pages */
export const uploadPdf = uploadFile

// ─── PDF Operations ───────────────────────────────────────────────────────────

export const editPdf = async (request: EditRequest): Promise<ProcessResponse> => {
  const { data } = await apiClient.post<ApiResponse<ProcessResponse>>('/pdf/edit', request)
  return data.data
}

export const mergePdfs = async (request: MergeRequest): Promise<ProcessResponse> => {
  const { data } = await apiClient.post<ApiResponse<ProcessResponse>>('/pdf/merge', request)
  return data.data
}

export const splitPdf = async (request: SplitRequest): Promise<ProcessResponse> => {
  const { data } = await apiClient.post<ApiResponse<ProcessResponse>>('/pdf/split', request)
  return data.data
}

export const compressPdf = async (request: CompressRequest): Promise<CompressResponse> => {
  const { data } = await apiClient.post<ApiResponse<CompressResponse>>('/pdf/compress', request)
  return data.data
}

export const watermarkPdf = async (request: WatermarkRequest): Promise<ProcessResponse> => {
  const { data } = await apiClient.post<ApiResponse<ProcessResponse>>('/pdf/watermark', request)
  return data.data
}

export const signPdf = async (request: SignRequest): Promise<ProcessResponse> => {
  const { data } = await apiClient.post<ApiResponse<ProcessResponse>>('/pdf/sign', request)
  return data.data
}

export const convertPdf = async (request: ConvertRequest): Promise<ProcessResponse> => {
  const { data } = await apiClient.post<ApiResponse<ProcessResponse>>('/pdf/convert', request)
  return data.data
}

export const managePages = async (request: PageManageRequest): Promise<ProcessResponse> => {
  const { data } = await apiClient.post<ApiResponse<ProcessResponse>>('/pdf/manage-pages', request)
  return data.data
}

export const securePdf = async (request: SecurityRequest): Promise<ProcessResponse> => {
  const { data } = await apiClient.post<ApiResponse<ProcessResponse>>('/pdf/security', request)
  return data.data
}

// ─── Download ─────────────────────────────────────────────────────────────────

export const downloadFile = async (downloadId: string): Promise<Blob> => {
  const response = await apiClient.get(`/pdf/download/${downloadId}`, {
    responseType: 'blob',
  })
  return response.data as Blob
}

export const deleteTempFile = async (fileId: string): Promise<void> => {
  await apiClient.delete(`/pdf/delete-temp/${fileId}`)
}

/** Trigger a browser file download from a Blob */
export const triggerDownload = (blob: Blob, fileName: string): void => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export default apiClient
