// Site-wide links for the public shell (header dropdown, mobile menu, footer).

// TODO: replace with the Coaching Centre's real page once it exists.
// It previously pointed at /SwagatCoachingCentre_Bhawanipatna, which has no route.
export const COACHING_CENTRE_URL = '/'

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
    { name: 'Coaching Centre', detail: 'Bhawanipatna', to: COACHING_CENTRE_URL },
]

export const LOGO_WHITE = '/images/brand/swagat-logo-white.webp'
export const LOGO_COLOR = '/images/brand/swagat-logo.webp'
export const LOGO_SIZE = { width: 362, height: 120 }
