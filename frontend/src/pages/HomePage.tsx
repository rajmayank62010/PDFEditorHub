import { Link } from 'react-router-dom'
import {
  FileEdit, GitMerge, Scissors, Archive, PenTool, Droplets,
  Image, FileImage, Shield, Zap, Lock, Monitor,
  ChevronRight, Upload, Star
} from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'
import { websiteSchema, organizationSchema, softwareAppSchema, faqSchema } from '@/components/seo/schemas'

const tools = [
  {
    icon: FileEdit,
    title: 'Edit PDF',
    description: 'Add text, shapes, highlights, and annotations to any PDF.',
    href: '/edit-pdf',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: GitMerge,
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one document with drag-and-drop ordering.',
    href: '/merge-pdf',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: Scissors,
    title: 'Split PDF',
    description: 'Split PDFs by page ranges or extract specific pages.',
    href: '/split-pdf',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    icon: Archive,
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality.',
    href: '/compress-pdf',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  {
    icon: PenTool,
    title: 'Sign PDF',
    description: 'Draw, type, or upload your signature and place it anywhere.',
    href: '/sign-pdf',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    icon: Droplets,
    title: 'Watermark PDF',
    description: 'Add text or image watermarks with custom opacity and position.',
    href: '/watermark-pdf',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  {
    icon: Image,
    title: 'PDF to JPG',
    description: 'Convert PDF pages to high-quality JPG images.',
    href: '/pdf-to-jpg',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
  },
  {
    icon: FileImage,
    title: 'JPG to PDF',
    description: 'Convert images to PDF documents instantly.',
    href: '/jpg-to-pdf',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
]

const features = [
  {
    icon: Shield,
    title: 'No Sign Up Required',
    description: 'Use all tools instantly without creating an account or providing any personal information.',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your files are processed securely and automatically deleted after processing. We never store your documents.',
  },
  {
    icon: Zap,
    title: 'Fast Processing',
    description: 'Powered by high-performance servers to process your PDFs in seconds, not minutes.',
  },
  {
    icon: Shield,
    title: 'Secure Downloads',
    description: 'Download links expire immediately after use. Your processed files are never accessible to others.',
  },
  {
    icon: Monitor,
    title: 'Works on Any Device',
    description: 'Fully responsive design works perfectly on desktop, tablet, and mobile browsers.',
  },
  {
    icon: Star,
    title: 'Professional Quality',
    description: 'Enterprise-grade PDF processing that maintains document quality and formatting.',
  },
]

const faqs = [
  {
    question: 'Is PDFEditorHub really free?',
    answer: 'Yes, PDFEditorHub is completely free to use. All PDF tools including editing, merging, splitting, compressing, and converting are available at no cost.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No registration or account is required. You can use all PDF tools immediately without signing up or providing any personal information.',
  },
  {
    question: 'Are my files safe and private?',
    answer: 'Absolutely. Your files are processed securely in memory and automatically deleted after processing. We never permanently store your documents, and download links expire immediately after use.',
  },
  {
    question: 'What is the maximum file size?',
    answer: 'You can upload PDF files up to 50MB. For larger files, we recommend compressing them first using our PDF compression tool.',
  },
  {
    question: 'What PDF operations are supported?',
    answer: 'PDFEditorHub supports editing, merging, splitting, compressing, watermarking, signing, converting (PDF to JPG, JPG to PDF, PDF to Word), and page management operations.',
  },
  {
    question: 'Is PDFEditorHub GDPR compliant?',
    answer: 'Yes. Since we do not store any user data or uploaded files, and require no registration, PDFEditorHub is designed with GDPR compliance in mind.',
  },
]

export default function HomePage() {
  const schemas = [
    websiteSchema,
    organizationSchema,
    softwareAppSchema,
    faqSchema(faqs),
  ]

  return (
    <>
      <SEOHead
        title="PDFEditorHub - Free Online PDF Editor, Merger, Splitter & Converter"
        description="Edit, merge, split, compress, convert and sign PDFs online for free. No registration required. Privacy-first PDF tools that work in your browser."
        canonical="/"
        keywords="PDF editor online, free PDF editor, merge PDF, split PDF, compress PDF, sign PDF online, PDF converter, edit PDF online"
        schema={schemas}
      />

      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 md:py-28 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Privacy-First PDF Tools — No Registration Required
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Edit PDFs Online{' '}
              <span className="text-gradient">for Free</span>
            </h1>

            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Fast, Secure, Privacy-Focused PDF Editing Tools. No sign-up. No storage. Just results.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/edit-pdf" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload PDF
              </Link>
              <Link to="#tools" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
                Explore Tools
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                No file storage
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                No registration
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                GDPR friendly
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                100% free
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section id="tools" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Popular PDF Tools</h2>
            <p className="section-subtitle">
              Everything you need to work with PDFs — all free, all private, all in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className={`tool-card group border ${tool.border}`}
                >
                  <div className={`w-12 h-12 ${tool.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{tool.description}</p>
                  <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${tool.color}`}>
                    Use Tool <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose PDFEditorHub?</h2>
            <p className="section-subtitle">
              Built with privacy and performance as the top priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Privacy Statement */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary-300" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Your Privacy is Our Priority</h2>
          <p className="text-primary-200 text-lg leading-relaxed">
            Your files are processed securely and automatically deleted after processing.
            We never permanently store uploaded documents. No user accounts, no file history,
            no tracking of your content. Just fast, private PDF processing.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about PDFEditorHub.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group card p-6 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-gray-900 list-none">
                  {faq.question}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Edit Your PDF?
          </h2>
          <p className="text-primary-200 text-lg mb-8">
            No sign-up required. Start editing your PDF in seconds.
          </p>
          <Link to="/edit-pdf" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
            <Upload className="w-5 h-5" />
            Upload Your PDF Now
          </Link>
        </div>
      </section>
    </>
  )
}
