import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FileText, Menu, X, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

const tools = [
  { label: 'Edit PDF', href: '/edit-pdf' },
  { label: 'Merge PDF', href: '/merge-pdf' },
  { label: 'Split PDF', href: '/split-pdf' },
  { label: 'Compress PDF', href: '/compress-pdf' },
  { label: 'Sign PDF', href: '/sign-pdf' },
  { label: 'Watermark PDF', href: '/watermark-pdf' },
  { label: 'PDF to JPG', href: '/pdf-to-jpg' },
  { label: 'JPG to PDF', href: '/jpg-to-pdf' },
  { label: 'PDF to Word', href: '/pdf-to-word' },
  { label: 'Word to PDF', href: '/word-to-pdf' },
  { label: 'Page Manager', href: '/page-manager' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-primary-200 transition-shadow">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              PDF<span className="text-primary-600">EditorHub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )
              }
            >
              Home
            </NavLink>

            {/* Tools Dropdown */}
            <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                Tools <ChevronDown className={clsx('w-4 h-4 transition-transform', toolsOpen && 'rotate-180')} />
              </button>
              {toolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {tools.map(tool => (
                    <NavLink
                      key={tool.href}
                      to={tool.href}
                      className={({ isActive }) =>
                        clsx('block px-4 py-2 text-sm transition-colors',
                          isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        )
                      }
                    >
                      {tool.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/edit-pdf" className="btn-primary text-sm py-2 px-5">
              Upload PDF
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
            <NavLink
              to="/"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </NavLink>
            <div className="pt-2 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tools</p>
            </div>
            {tools.map(tool => (
              <NavLink
                key={tool.href}
                to={tool.href}
                className={({ isActive }) =>
                  clsx('block px-3 py-2 rounded-lg text-sm',
                    isActive ? 'text-primary-600 bg-primary-50 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  )
                }
                onClick={() => setMobileOpen(false)}
              >
                {tool.label}
              </NavLink>
            ))}
            <div className="pt-3 pb-2">
              <Link
                to="/edit-pdf"
                className="btn-primary w-full text-center block text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Upload PDF
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
