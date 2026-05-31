import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const EditPdfPage = lazy(() => import('@/pages/tools/EditPdfPage'))
const MergePdfPage = lazy(() => import('@/pages/tools/MergePdfPage'))
const SplitPdfPage = lazy(() => import('@/pages/tools/SplitPdfPage'))
const CompressPdfPage = lazy(() => import('@/pages/tools/CompressPdfPage'))
const SignPdfPage = lazy(() => import('@/pages/tools/SignPdfPage'))
const WatermarkPdfPage = lazy(() => import('@/pages/tools/WatermarkPdfPage'))
const PdfToJpgPage = lazy(() => import('@/pages/tools/PdfToJpgPage'))
const JpgToPdfPage = lazy(() => import('@/pages/tools/JpgToPdfPage'))
const PdfToWordPage = lazy(() => import('@/pages/tools/PdfToWordPage'))
const WordToPdfPage = lazy(() => import('@/pages/tools/WordToPdfPage'))
const PageManagerPage = lazy(() => import('@/pages/tools/PageManagerPage'))
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/edit-pdf" element={<EditPdfPage />} />
          <Route path="/merge-pdf" element={<MergePdfPage />} />
          <Route path="/split-pdf" element={<SplitPdfPage />} />
          <Route path="/compress-pdf" element={<CompressPdfPage />} />
          <Route path="/sign-pdf" element={<SignPdfPage />} />
          <Route path="/watermark-pdf" element={<WatermarkPdfPage />} />
          <Route path="/pdf-to-jpg" element={<PdfToJpgPage />} />
          <Route path="/jpg-to-pdf" element={<JpgToPdfPage />} />
          <Route path="/pdf-to-word" element={<PdfToWordPage />} />
          <Route path="/word-to-pdf" element={<WordToPdfPage />} />
          <Route path="/page-manager" element={<PageManagerPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
