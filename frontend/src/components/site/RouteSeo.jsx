import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { ROUTE_SEO, SITE_IMAGE, SITE_NAME, absoluteUrl, breadcrumbJsonLd, webPageJsonLd } from '../../seo/routes'

// Title, description, canonical, social tags and page-level structured data for each public route.
// Pages with their own <Helmet> (school pages) are not in ROUTE_SEO, so this renders nothing there.
const RouteSeo = () => {
    const { pathname } = useLocation()
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const seo = ROUTE_SEO[path]
    if (!seo) return null

    const url = absoluteUrl(path)
    const graph = [webPageJsonLd(path, seo)]
    if (seo.crumbs?.length) graph.push(breadcrumbJsonLd(seo.crumbs))

    return (
        <Helmet>
            <title>{seo.title}</title>
            <meta name="description" content={seo.description} />
            {seo.noindex && <meta name="robots" content="noindex, follow" />}
            <link rel="canonical" href={url} />
            <link rel="alternate" hrefLang="en-IN" href={url} />
            <link rel="alternate" hrefLang="x-default" href={url} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={seo.title} />
            <meta property="og:description" content={seo.description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={SITE_IMAGE} />
            <meta property="og:locale" content="en_IN" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={seo.title} />
            <meta name="twitter:description" content={seo.description} />
            {!seo.noindex && (
                <script type="application/ld+json">
                    {JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}
                </script>
            )}
        </Helmet>
    )
}

export default RouteSeo
