import { Mail, MessageSquare } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'

export default function ContactPage() {
  return (
    <>
      <SEOHead
        title="Contact Us - PDFEditorHub"
        description="Contact PDFEditorHub for support or feedback about our free online PDF tools."
        canonical="/contact"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-gray-600">Have a question or feedback? We'd love to hear from you.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>General Question</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Privacy Concern</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={5}
                placeholder="Your message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Send Message
            </button>
          </form>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <Mail className="w-4 h-4" />
          <span>Or email us directly at <a href="mailto:support@pdfeditorhub.com" className="text-primary-600 hover:underline">support@pdfeditorhub.com</a></span>
        </div>
      </div>
    </>
  )
}
