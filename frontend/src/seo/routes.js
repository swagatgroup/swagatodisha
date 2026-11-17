// Per-page SEO for the public site: title, description, canonical URL, breadcrumbs.
// Used by RouteSeo (client, react-helmet-async) and by scripts/prerender.mjs (static HTML per route).
// Keep descriptions factual: places, courses and contact details that the pages themselves show.

export const SITE_URL = 'https://www.swagatodisha.com'
export const SITE_NAME = 'Swagat Group of Institutions'
export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const SITE_IMAGE = `${SITE_URL}/Swagat_Logo.png`
export const PHONE_DISPLAY = '+91 78559 59544'

const PLACES = 'Sargiguda (Kantabanji), Bangomunda, Titilagarh, Sinapali, Ghantiguda and Bhawanipatna'

export const ROUTE_SEO = {
    '/': {
        title: 'Swagat Group of Institutions | Regular & Distance Courses in Odisha – Kantabanji, Balangir',
        description: `Affordable regular and distance courses in Odisha, with support from admission to course completion. Campuses at ${PLACES}. Call ${PHONE_DISPLAY}.`,
        crumbs: [],
    },
    '/courses': {
        title: 'Regular & Distance Courses in Odisha: Fees & Duration | Swagat Group of Institutions',
        description: `All courses at Swagat Group of Institutions, western Odisha: NIOS and BOSSE open schooling, B.A., B.Sc., B.Com., BBA, MBA, BCA, nursing, paramedical, B.Ed. and more, with duration and fees. Call ${PHONE_DISPLAY}.`,
        crumbs: [{ name: 'Courses', path: '/courses' }],
    },
    '/about': {
        title: 'About Swagat Group of Institutions | Education in Western Odisha',
        description: `About Swagat Group of Institutions: affordable regular and distance education in Balangir, Nuapada and Kalahandi districts of Odisha, with campuses at ${PLACES}.`,
        crumbs: [{ name: 'About Us', path: '/about' }],
    },
    '/gallery': {
        title: 'Gallery | Swagat Group of Institutions, Odisha',
        description: 'Photos of campus life, events and celebrations at Swagat Group of Institutions campuses in western Odisha.',
        crumbs: [{ name: 'Gallery', path: '/gallery' }],
    },
    '/contact': {
        title: 'Contact Swagat Group of Institutions | Sargiguda, Kantabanji, Balangir',
        description: `Contact Swagat Group of Institutions: main campus at Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha 767039. Call ${PHONE_DISPLAY} or email contact@swagatodisha.com.`,
        crumbs: [{ name: 'Contact Us', path: '/contact' }],
    },
    '/send-message': {
        title: 'Send a Message | Swagat Group of Institutions',
        description: `Send your admission or course question to Swagat Group of Institutions, Odisha. Or call ${PHONE_DISPLAY}.`,
        crumbs: [{ name: 'Contact Us', path: '/contact' }, { name: 'Send a Message', path: '/send-message' }],
    },
    '/terms-and-conditions': {
        title: 'Terms and Conditions | Swagat Group of Institutions',
        description: 'Terms and conditions for using the Swagat Group of Institutions website and student portal.',
        crumbs: [{ name: 'Terms and Conditions', path: '/terms-and-conditions' }],
    },
    '/privacy-policy': {
        title: 'Privacy Policy | Swagat Group of Institutions',
        description: 'How Swagat Group of Institutions collects, uses and protects personal information on its website and student portal.',
        crumbs: [{ name: 'Privacy Policy', path: '/privacy-policy' }],
    },
    // Sign-in pages: reachable, but kept out of search results
    '/login-portal': { title: 'Sign In | Swagat Group of Institutions', description: 'Sign in to the Swagat student, agent and staff portal.', noindex: true },
    '/login/student': { title: 'Student Login | Swagat Group of Institutions', description: 'Student sign in for Swagat Group of Institutions.', noindex: true },
    '/login/agent': { title: 'Agent Login | Swagat Group of Institutions', description: 'Agent sign in for Swagat Group of Institutions.', noindex: true },
    '/login/staff': { title: 'Staff Login | Swagat Group of Institutions', description: 'Staff sign in for Swagat Group of Institutions.', noindex: true },
    '/register': {
        title: 'Register for Admission | Swagat Group of Institutions, Odisha',
        description: `Create your Swagat account to apply for regular or distance courses in Odisha. Need help? Call ${PHONE_DISPLAY}.`,
        crumbs: [{ name: 'Register', path: '/register' }],
    },
}

// Routes written as static HTML at build time (school pages set their own SEO in SchoolPageTemplate)
export const PRERENDER_ROUTES = [
    '/', '/courses', '/about', '/gallery', '/contact', '/send-message',
    '/terms-and-conditions', '/privacy-policy', '/register',
    '/SwagatPublicSchool_Sargiguda', '/SwagatPublicSchool_Ghantiguda', '/SwagatPublicSchool_Lakhna',
]

export const absoluteUrl = (path) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`)

export const breadcrumbJsonLd = (crumbs) => ({
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...crumbs].map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
    })),
})

export const webPageJsonLd = (path, seo) => ({
    '@type': path === '/contact' ? 'ContactPage' : path === '/about' ? 'AboutPage' : path === '/courses' ? 'CollectionPage' : 'WebPage',
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: seo.title,
    description: seo.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en-IN',
})
