import { Link } from 'react-router-dom'
import { FileText, Shield, Zap, Lock } from 'lucide-react'

const toolLinks = [
  { label: 'Edit PDF', href: '/edit-pdf' },
  { label: 'Merge PDF', href: '/merge-pdf' },
  { label: 'Split PDF', href: '/split-pdf' },
  { label: 'Compress PDF', href: '/compress-pdf' },
  { label: 'Sign PDF', href: '/sign-pdf' },
  { label: 'Watermark PDF', href: '/watermark-pdf' },
]

const convertLinks = [
  { label: 'PDF to JPG', href: '/pdf-to-jpg' },
  { label: 'JPG to PDF', href: '/jpg-to-pdf' },
  { label: 'PDF to Word', href: '/pdf-to-word' },
  { label: 'Word to PDF', href: '/word-to-pdf' },
  { label: 'Page Manager', href: '/page-manager' },
]

const companyLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Privacy Banner */}
      <div className="bg-primary-900/50 border-b border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-400" />
              <span>Files deleted after processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary-400" />
              <span>No permanent storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-400" />
              <span>No registration required</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                PDF<span className="text-primary-400">EditorHub</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Free, privacy-focused online PDF tools. No registration required. Your files are processed securely and automatically deleted after processing.
            </p>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="font-semibold text-white mb-4">PDF Tools</h3>
            <ul className="space-y-2">
              {toolLinks.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Convert */}
          <div>
            <h3 className="font-semibold text-white mb-4">Convert & Manage</h3>
            <ul className="space-y-2">
              {convertLinks.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} PDFEditorHub. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Your files are processed securely and automatically deleted after processing. We never permanently store uploaded documents.
          </p>
        </div>
      </div>
    </footer>
  )
}
