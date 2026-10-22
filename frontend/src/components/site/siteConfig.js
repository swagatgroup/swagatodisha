// Site-wide links for the public shell (header dropdown, mobile menu, footer).

// Set to the Coaching Centre's page (e.g. '/SwagatCoachingCentre_Bhawanipatna' once that route
// exists, or an external https:// address) and it appears in the Institutions menu automatically.
// While it's null the entry is hidden, so visitors never land on a link that goes nowhere.
export const COACHING_CENTRE_URL = null

// Studio credit shown in the footer
export const DESIGNER_CREDIT = {
    label: 'Designed & developed by Code Hyphen',
    url: 'https://www.codehyphen.in/',
}

// The destinations from the former entry screen ("Choose your destination")
export const INSTITUTION_SITES = [
    { name: 'RCTI', detail: 'Swagat Odisha', href: 'https://www.rcti.swagatodisha.com', external: true },
    { name: 'Public School', detail: 'Ghantiguda', to: '/SwagatPublicSchool_Ghantiguda' },
    { name: 'Public School', detail: 'Sargiguda', to: '/SwagatPublicSchool_Sargiguda' },
    { name: 'Public School', detail: 'Lakhna', to: '/SwagatPublicSchool_Lakhna' },
    COACHING_CENTRE_URL && (/^https?:\/\//.test(COACHING_CENTRE_URL)
        ? { name: 'Coaching Centre', detail: 'Bhawanipatna', href: COACHING_CENTRE_URL, external: true }
        : { name: 'Coaching Centre', detail: 'Bhawanipatna', to: COACHING_CENTRE_URL }),
].filter(Boolean)

export const LOGO_WHITE = '/images/brand/swagat-logo-white.webp'
export const LOGO_COLOR = '/images/brand/swagat-logo.webp'
export const LOGO_SIZE = { width: 362, height: 120 }
