import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  keywords?: string
  schema?: object | object[]
  noIndex?: boolean
}

const SITE_NAME = 'PDFEditorHub'
const SITE_URL = 'https://pdfeditorhub.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  keywords,
  schema,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined

  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : []

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org JSON-LD */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
