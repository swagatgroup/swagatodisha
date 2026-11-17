// Visible question-and-answer content, mirrored in FAQPage structured data (FaqSection) and llms-full.txt.
// Facts only: places, courses, contact details and the support promise the site already states.

const PHONE = '+91 78559 59544'

const BEST_DISTANCE = {
    q: 'Which is the best institute for distance courses in Odisha?',
    a: `Choose by the courses, fees, approvals and the support you get until you finish. Swagat Group of Institutions offers affordable regular and distance courses from seven campuses in western Odisha (Balangir, Nuapada and Kalahandi districts) and stays with students from admission to course completion. Call ${PHONE} to compare courses and fees.`,
}

const WHERE = {
    q: 'Where is Swagat Group of Institutions?',
    a: 'The main campus is at Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha 767039. Other campuses are in Kantabanji, Bangomunda, Titilagarh, Sinapali, Ghantiguda and Bhawanipatna.',
}

const APPLY = {
    q: 'How do I apply or ask about admission?',
    a: `Call ${PHONE}, email contact@swagatodisha.com, or register on the website. You can also visit any of the seven campuses.`,
}

export const HOME_FAQS = [
    BEST_DISTANCE,
    WHERE,
    {
        q: 'Does Swagat offer distance education in Odisha?',
        a: 'Yes. Swagat offers both regular and distance courses, and supports students from admission through to course completion.',
    },
    {
        q: 'Which courses does Swagat offer?',
        a: 'School and open schooling (NIOS, BOSSE and OSBME), degree courses such as B.A., B.Sc., B.Com. and B.S.W., management (BBA, MBA), paramedical and nursing, engineering and polytechnic, teacher education (B.Ed., D.El.Ed.) and computer courses (DCA, BCA, MCA). The Courses page lists every course with its duration and fees.',
    },
    {
        q: 'Where can I find exam notifications, time tables and results?',
        a: 'Open the Explore Swagat section on the homepage. It has Exam Notifications, Time Tables, Results and Latest Updates, and anything uploaded in the last 60 days is marked New.',
    },
    {
        q: 'Can Swagat help me choose a career after 10th?',
        a: `Yes. The Career Roadmap After 10th on the homepage shows science, commerce, arts and vocational paths, and you can call ${PHONE} for career counselling.`,
    },
    APPLY,
]

export const COURSE_FAQS = [
    {
        q: 'Which distance courses can I study with Swagat in Odisha?',
        a: `Swagat offers 10th and +2 through open schooling (NIOS, BOSSE and OSBME), plus degree, management, paramedical, teacher education and computer courses. Whether a course runs in regular or distance mode depends on the course and session, so call ${PHONE} to confirm the mode for the course you want.`,
    },
    {
        q: 'Can I complete 10th or +2 through open schooling in Odisha?',
        a: 'Yes. Swagat offers 10th and +2 (Arts, Science, Commerce) through NIOS and BOSSE, and 10th and +2 (Arts, Commerce) through OSBME.',
    },
    {
        q: 'How much do the courses cost?',
        a: `Each course on this page shows its fee structure. Swagat keeps its fees affordable; call ${PHONE} to confirm the fees for the current session.`,
    },
    {
        q: 'How long do the courses take?',
        a: 'Computer certificate and diploma courses take 3 to 8 months, PG diplomas 1 year, D.El.Ed., B.Ed., M.Ed. and most master\'s degrees 2 years, bachelor\'s degrees and polytechnic diplomas 3 years, and B.Tech, B.Sc. Nursing and B.Sc. Physiotherapy 4 years.',
    },
    {
        q: 'Does Swagat support students after admission?',
        a: 'Yes. Swagat stays with students from admission to course completion, not just until the fee is paid.',
    },
    BEST_DISTANCE,
    APPLY,
]

export const faqJsonLd = (items, pageUrl) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
})
