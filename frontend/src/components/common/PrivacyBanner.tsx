import { useState } from 'react'
import { Shield, X } from 'lucide-react'

export default function PrivacyBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('privacy-banner-dismissed') === 'true'
  })

  if (dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem('privacy-banner-dismissed', 'true')
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary-900 text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary-300 flex-shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">Privacy First:</span>{' '}
            Your files are processed securely and automatically deleted after processing. We never permanently store uploaded documents.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-primary-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
