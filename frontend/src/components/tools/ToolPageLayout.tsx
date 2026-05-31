import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Shield } from 'lucide-react'
import { clsx } from 'clsx'

interface ToolPageLayoutProps {
  title: string
  description: string
  icon: ReactNode
  iconBg?: string
  children: ReactNode
  faqs?: { question: string; answer: string }[]
  breadcrumb?: { label: string; href?: string }[]
}

export default function ToolPageLayout({
  title,
  description,
  icon,
  iconBg = 'bg-primary-100',
  children,
  faqs,
  breadcrumb,
}: ToolPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          {breadcrumb && (
            <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />
                  {item.href ? (
                    <Link to={item.href} className="hover:text-primary-600 transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <div className="flex items-start gap-4">
            <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0', iconBg)}>
              {icon}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1 max-w-2xl">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy Notice */}
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-sm text-green-800">
          <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
          Your files are processed securely and automatically deleted after processing. We never permanently store uploaded documents.
        </div>

        {children}

        {/* FAQ */}
        {faqs && faqs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group card p-5 cursor-pointer">
                  <summary className="flex items-center justify-between font-medium text-gray-900 list-none">
                    {faq.question}
                    <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                  </summary>
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
