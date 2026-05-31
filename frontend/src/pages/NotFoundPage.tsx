import { Link } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'

export default function NotFoundPage() {
  return (
    <>
      <SEOHead
        title="Page Not Found - PDFEditorHub"
        description="The page you're looking for doesn't exist."
        noIndex={true}
      />
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">404</h1>
          <p className="text-xl text-gray-600 mb-2">Page not found</p>
          <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </>
  )
}
