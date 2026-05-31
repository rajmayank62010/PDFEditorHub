import SEOHead from '@/components/seo/SEOHead'

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy - PDFEditorHub"
        description="PDFEditorHub privacy policy. Learn how we handle your files and data. We never permanently store your uploaded documents."
        canonical="/privacy-policy"
        noIndex={false}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: January 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Privacy Commitment</h2>
            <p className="text-gray-600 leading-relaxed">
              PDFEditorHub is built with privacy as a core principle. We process your files securely and automatically delete them after processing. We never permanently store your uploaded documents, and we do not require any registration or personal information to use our tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">File Processing</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Files are processed in memory whenever possible</li>
              <li>Any temporary files are automatically deleted after processing</li>
              <li>Download links expire immediately after use</li>
              <li>No file content is logged or stored in any database</li>
              <li>No user file history is maintained</li>
              <li>No tracking of uploaded content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">No Registration Required</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not require you to create an account or provide any personal information. You can use all PDF tools anonymously.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies & Analytics</h2>
            <p className="text-gray-600 leading-relaxed">
              We use minimal, privacy-respecting analytics to understand how our tools are used. We do not use tracking cookies or share data with third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">GDPR Compliance</h2>
            <p className="text-gray-600 leading-relaxed">
              Since we do not collect personal data and do not store uploaded files, PDFEditorHub is designed to be GDPR-friendly. No data subject requests are necessary as we do not retain any personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Security</h2>
            <p className="text-gray-600 leading-relaxed">
              All file transfers are encrypted using HTTPS/TLS. Files are processed in isolated environments and automatically cleaned up after processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about our privacy practices, please contact us at privacy@pdfeditorhub.com.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
