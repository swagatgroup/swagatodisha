import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { LuArrowUpRight, LuClock, LuPhone, LuUserPlus } from 'react-icons/lu'
import { INSTITUTIONS } from '../data/institutions'
import { COURSE_FAQS } from '../data/faqs'
import { CONTACT_INFO } from '../utils/constants'
import { ORG_ID, SITE_URL } from '../seo/routes'
import PageHero from './site/PageHero'
import { Container, SectionHeader } from './site/Layout'
import Badge from './site/Badge'
import Button from './site/Button'
import Icon from './site/Icon'
import FaqSection from './site/FaqSection'

// Every course in the catalogue, flattened: programmes with sub-courses list those, others are a course themselves
const coursesOf = (program) => (program.subCategories?.length ? program.subCategories : [program])
const totalFeeOf = (course) => course.feeStructure?.totalProgramFee || course.feeStructure?.totalFee || null
const COURSE_COUNT = INSTITUTIONS.reduce((sum, inst) => sum + inst.programs.reduce((n, p) => n + coursesOf(p).length, 0), 0)

// "3 Years" -> P3Y, "6 Months" -> P6M (schema.org timeRequired)
const isoDuration = (text) => {
    const match = /^(\d+)\s*(year|month)/i.exec(text || '')
    return match ? `P${match[1]}${match[2].toLowerCase() === 'year' ? 'Y' : 'M'}` : undefined
}

const coursesJsonLd = () => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/courses#courses`,
    name: 'Courses at Swagat Group of Institutions, Odisha',
    numberOfItems: COURSE_COUNT,
    itemListElement: INSTITUTIONS.flatMap((inst) => inst.programs.flatMap(coursesOf).map((course) => ({ inst, course })))
        .map(({ inst, course }, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Course',
                name: course.name,
                description: course.details || `${course.name} at ${inst.name}`,
                url: `${SITE_URL}/courses#${inst.id}`,
                provider: { '@id': ORG_ID },
                ...(isoDuration(course.duration) && { timeRequired: isoDuration(course.duration) }),
            },
        })),
})

const GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'

const CourseCard = ({ course, heading: Heading }) => {
    const fee = totalFeeOf(course)
    const label = course.duration || course.type
    return (
        <li className="flex flex-col rounded-sw-md bg-sw-white p-4 ring-1 ring-inset ring-sw-border-light">
            <Heading className="text-sw-label font-bold">{course.name}</Heading>
            <div className="mt-2 flex flex-wrap gap-2">
                {label && (
                    <Badge tone="blue">
                        {course.duration && <Icon icon={LuClock} size={14} />}
                        {label}
                    </Badge>
                )}
                {fee && <Badge tone="peach">Total fee {fee}</Badge>}
            </div>
            {course.details && <p className="mt-2 text-sw-small text-sw-text-secondary">{course.details}</p>}
            {course.websiteUrl && (
                <Link to={course.websiteUrl} className="mt-auto inline-flex min-h-11 items-center gap-1 pt-2 text-sw-small font-semibold underline-offset-4 hover:underline">
                    Visit the school page <Icon icon={LuArrowUpRight} size="xs" />
                </Link>
            )}
        </li>
    )
}

const CoursesPage = () => (
    <div>
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(coursesJsonLd())}</script>
        </Helmet>

        <PageHero
            eyebrow={<Badge tone="dark">{COURSE_COUNT} courses · 7 campuses in western Odisha</Badge>}
            title="Regular & Distance Courses in Odisha"
            intro="From open schooling to degrees, management, nursing and computer courses: affordable fees, and Swagat beside you from admission to the day you complete."
        >
            <nav aria-label="Course categories" className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
                {INSTITUTIONS.map((inst) => (
                    <a
                        key={inst.id}
                        href={`#${inst.id}`}
                        className="inline-flex min-h-11 items-center rounded-sw-pill bg-sw-white/10 px-4 text-sw-small font-semibold text-sw-white ring-1 ring-inset ring-sw-white/20 hover:bg-sw-white/20"
                    >
                        {inst.name}
                    </a>
                ))}
            </nav>
        </PageHero>

        {INSTITUTIONS.map((inst, index) => (
            <section
                key={inst.id}
                id={inst.id}
                aria-labelledby={`${inst.id}-title`}
                className={`sw-section scroll-mt-sw-header ${index % 2 ? 'bg-sw-surface-muted' : 'bg-sw-white'}`}
            >
                <Container>
                    <SectionHeader id={`${inst.id}-title`} title={inst.name} subtitle={inst.description} />
                    <div className="space-y-8">
                        {/* Programmes that are a single course (schools, open schooling, B.Ed.) share one grid */}
                        {inst.programs.some((program) => !program.subCategories?.length) && (
                            <ul className={GRID}>
                                {inst.programs.filter((program) => !program.subCategories?.length).map((program) => (
                                    <CourseCard key={program.name} course={program} heading="h3" />
                                ))}
                            </ul>
                        )}
                        {inst.programs.filter((program) => program.subCategories?.length).map((program) => (
                            <div key={program.name}>
                                <h3 className="mb-3 text-sw-h3 font-bold">
                                    {program.name}
                                    {program.type && <span className="ml-2 text-sw-body font-normal text-sw-text-muted">{program.type}</span>}
                                </h3>
                                <ul className={GRID}>
                                    {program.subCategories.map((course) => (
                                        <CourseCard key={course.name} course={course} heading="h4" />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>
        ))}

        <section aria-labelledby="courses-cta-title" className="sw-deco-navy bg-sw-black text-sw-text-on-dark">
            <div className="sw-container py-12 text-center lg:py-16">
                <h2 id="courses-cta-title" className="text-sw-h2 font-bold">Not sure which course is right for you?</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sw-subtitle text-sw-text-on-dark-secondary">
                    Talk to our team about courses, fees and whether regular or distance mode suits you. Fees on this page are a guide; we confirm the current session&apos;s fees when you call.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`} variant="inverse" iconLeft={LuPhone}>Call +91 78559 59544</Button>
                    <Button to="/register" variant="glass" iconLeft={LuUserPlus}>Register for Admission</Button>
                </div>
            </div>
        </section>

        <FaqSection
            id="courses-faq-title"
            path="/courses"
            title="Course Questions, Answered"
            subtitle="What students across Odisha ask before choosing a regular or distance course."
            items={COURSE_FAQS}
        />
    </div>
)

export default CoursesPage
