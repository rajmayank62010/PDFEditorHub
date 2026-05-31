import SEOHead from '@/components/seo/SEOHead'

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title="Terms of Service - PDFEditorHub"
        description="PDFEditorHub terms of service. Free online PDF tools with no registration required."
        canonical="/terms"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: January 2025</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By using PDFEditorHub, you agree to these terms of service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Service Description</h2>
            <p className="text-gray-600 leading-relaxed">
              PDFEditorHub provides free online PDF processing tools including editing, merging, splitting, compressing, converting, and signing PDF files. The service is provided "as is" without warranties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptable Use</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>You may only upload files you own or have permission to process</li>
              <li>Do not upload illegal, harmful, or copyrighted content without authorization</li>
              <li>Do not attempt to abuse or overload our servers</li>
              <li>Do not use automated tools to scrape or abuse the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">File Limits</h2>
            <p className="text-gray-600 leading-relaxed">
              Maximum file size is 50MB per file. Maximum 10 files per merge operation. We reserve the right to adjust these limits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              PDFEditorHub is not liable for any loss of data, business interruption, or damages arising from use of our service. Always keep backups of important documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these terms at any time. Continued use of the service constitutes acceptance of updated terms.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
