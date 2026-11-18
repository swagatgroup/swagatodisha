import { useEffect, useId, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { LuArrowRight, LuBookOpen, LuCamera, LuExternalLink, LuMail, LuMapPin, LuNavigation, LuPencil, LuPhone, LuSparkles, LuStar, LuSun } from 'react-icons/lu'
import api from '../../utils/api'
import { toGalleryPhoto } from '../../data/gallery'
import { Container, Section } from '../site/Layout'
import Badge from '../site/Badge'
import Button from '../site/Button'
import Icon from '../site/Icon'
import FaqSection from '../site/FaqSection'
import { cx } from '../site/cx'
import { redesignImage } from '../site/redesignImages'
import PhotoGrid from '../gallery/PhotoGrid'

const SITE_URL = 'https://www.swagatodisha.com'

// Colour rotations that give each card its own crayon colour while staying in the blue family
const FEATURE_TONES = [
    'bg-sw-badge-blue',
    'bg-[rgb(var(--sw-sun)/0.32)]',
    'bg-sw-badge-lavender',
    'bg-[rgb(var(--sw-mint)/0.5)]',
    'bg-sw-badge-peach',
    'bg-[rgb(var(--sw-sky)/0.3)]',
]
const PROGRAM_TONES = [
    { band: 'bg-[rgb(var(--sw-sky))]', chip: 'bg-sw-badge-blue' },
    { band: 'bg-[rgb(var(--sw-sun))]', chip: 'bg-[rgb(var(--sw-sun)/0.35)]' },
    { band: 'bg-[rgb(var(--sw-mint))]', chip: 'bg-[rgb(var(--sw-mint)/0.5)]' },
]
const FACILITY_TONES = ['bg-[rgb(var(--sw-sky))]', 'bg-[rgb(var(--sw-sun))]', 'bg-[rgb(var(--sw-mint))]', 'bg-sw-badge-lavender']

// A section heading with the playful squiggle instead of the plain accent bar
const KidsHeading = ({ kicker, children, subtitle, align = 'center', tone = 'light', id }) => (
    <header className={cx('mb-8 md:mb-10', align === 'center' ? 'text-center' : 'text-left')}>
        {kicker && (
            <p className={cx('mb-3 inline-flex items-center gap-2 text-sw-small font-semibold uppercase tracking-[0.08em]', tone === 'dark' ? 'text-[rgb(var(--sw-sun))]' : 'text-[rgb(var(--sw-accent-blue))]')}>
                <Icon icon={LuStar} size="xs" /> {kicker}
            </p>
        )}
        <h2 id={id} className="text-sw-display-alt font-bold">{children}</h2>
        <span aria-hidden="true" className={cx('sw-squiggle mt-4 w-24', align === 'center' && 'mx-auto', tone === 'dark' ? 'text-[rgb(var(--sw-sun))]' : 'text-[rgb(var(--sw-sky))]')} />
        {subtitle && (
            <p className={cx('mt-4 text-sw-subtitle', align === 'center' && 'mx-auto max-w-[44rem]', tone === 'dark' ? 'text-sw-text-on-dark-secondary' : 'text-sw-text-secondary')}>
                {subtitle}
            </p>
        )}
    </header>
)

// Rotating circular seal with the school's name around it
const Seal = ({ text }) => {
    const pathId = `seal-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
    return (
        <span aria-hidden="true" className="absolute -bottom-4 -left-4 z-20 flex h-28 w-28 items-center justify-center rounded-sw-pill bg-[rgb(var(--sw-sun))] text-sw-black shadow-sw-overlay sm:h-32 sm:w-32">
            <svg viewBox="0 0 120 120" className="sw-spin-slow absolute inset-0 h-full w-full">
                <path id={pathId} d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" fill="none" />
                <text className="fill-current text-[10.5px] font-bold tracking-[0.12em]">
                    <textPath href={`#${pathId}`} textLength="280">{text}</textPath>
                </text>
            </svg>
            <Icon icon={LuStar} size="md" />
        </span>
    )
}

// Arch-shaped hero picture: a campus photo when one exists, otherwise a drawn classroom scene
const HeroArch = ({ photo, town, sealText, schoolName }) => {
    const fallback = redesignImage('school-hero-desktop')
    const src = photo?.src || fallback
    return (
        <figure className="relative mx-auto w-full max-w-[420px]">
            <div className="sw-arch relative aspect-[4/5] overflow-hidden bg-[rgb(var(--sw-accent-blue))] ring-[10px] ring-sw-white/10">
                {src ? (
                    <img src={src} alt={photo?.alt ? `${photo.alt}, ${schoolName}, ${town}` : `${schoolName}, ${town}`} className="h-full w-full object-cover" fetchpriority="high" />
                ) : (
                    <div aria-hidden="true" className="flex h-full w-full flex-col items-center justify-end gap-3 bg-[radial-gradient(70%_50%_at_50%_15%,rgb(var(--sw-sky)/0.9)_0%,transparent_70%)] pb-10">
                        <span className="sw-bob mb-auto mt-14 flex h-20 w-20 items-center justify-center rounded-sw-pill bg-[rgb(var(--sw-sun))] text-sw-black shadow-sw-soft">
                            <Icon icon={LuSun} size="lg" />
                        </span>
                        <div className="flex items-end gap-2">
                            {['A', 'B', 'C'].map((letter, i) => (
                                <span
                                    key={letter}
                                    className={cx(
                                        'flex items-center justify-center rounded-[14px] font-sw-display font-extrabold text-sw-black shadow-sw-soft',
                                        i === 1 ? 'h-20 w-20 -translate-y-6 rotate-3 bg-[rgb(var(--sw-sun))] text-4xl' : 'h-16 w-16 text-3xl',
                                        i === 0 && '-rotate-6 bg-sw-badge-blue',
                                        i === 2 && 'rotate-6 bg-[rgb(var(--sw-mint))]'
                                    )}
                                >
                                    {letter}
                                </span>
                            ))}
                        </div>
                        <span className="h-3 w-3/4 rounded-sw-pill bg-sw-white/25" />
                    </div>
                )}
            </div>
            <span aria-hidden="true" className="sw-bob absolute -right-3 top-16 z-20 flex h-14 w-14 items-center justify-center rounded-[18px] bg-sw-white text-[rgb(var(--sw-accent-blue))] shadow-sw-overlay [--sw-tilt:10deg]">
                <Icon icon={LuPencil} size="md" />
            </span>
            <span aria-hidden="true" className="sw-bob absolute -right-6 bottom-24 z-20 flex h-12 w-12 items-center justify-center rounded-sw-pill bg-sw-badge-lavender text-sw-black shadow-sw-overlay [--sw-tilt:-8deg] [animation-delay:1.2s]">
                <Icon icon={LuBookOpen} size="sm" />
            </span>
            <Seal text={sealText} />
        </figure>
    )
}

const SchoolPageTemplate = ({
    schoolName,
    location,
    description,
    features,
    programs,
    facilities,
    achievements,
    contactInfo,
    seoData,
    galleryCampus,
    officialSite,
    sameAs = [],
}) => {
    const [photos, setPhotos] = useState([])
    const town = location.split(',')[0].trim()
    const fullName = `${schoolName}, ${town}`
    const path = seoData.url.replace(SITE_URL, '') || '/'

    const contact = (title) => contactInfo.find((c) => c.title.toLowerCase().includes(title))?.value || ''
    const address = contact('address')
    const phone = contact('call')
    const email = contact('email')
    const telHref = `tel:${phone.replace(/[^+\d]/g, '')}`
    const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || `${fullName}, ${location}`)}`
    const cbse = /CBSE/i.test(description)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // This school's own photos from the gallery (uploaded in Website Management > Gallery)
    useEffect(() => {
        if (!galleryCampus) return undefined
        let cancelled = false
        api.get('/api/gallery/public', { params: { campus: galleryCampus, limit: 12 } })
            .then((res) => { if (!cancelled && res.data?.success) setPhotos((res.data.data || []).map(toGalleryPhoto)) })
            .catch(() => {})
        return () => { cancelled = true }
    }, [galleryCampus])

    const facts = useMemo(() => [
        ...(cbse ? ['CBSE curriculum'] : []),
        ...programs.map((p) => p.name),
        location,
        'Part of Swagat Group of Institutions',
    ], [cbse, programs, location])

    // Questions parents ask, answered only from what this page already states
    const faqs = useMemo(() => [
        {
            q: `Where is ${fullName}?`,
            a: `${fullName} is at ${address}. Call ${phone} for directions or to plan a visit.`,
        },
        {
            q: `Which classes does ${fullName} teach?`,
            a: `${programs.map((p) => p.name).join(', ')}.${cbse ? ' The school follows the CBSE curriculum.' : ''}`,
        },
        {
            q: `Is there a good school for my child near ${location.split(',').slice(0, 2).join(',')}?`,
            a: `${fullName} serves families in and around ${town}. Facilities include ${facilities.slice(0, 5).map((f) => f.name.toLowerCase()).join(', ')}. The best way to decide is to visit with your child and meet the teachers.`,
        },
        {
            q: `How do I get admission for my child at ${fullName}?`,
            a: `Call ${phone}${email ? ` or email ${email}` : ''}, or visit the school with your child. The team will explain the classes, fees and documents you need.`,
        },
        {
            q: `Who runs ${fullName}?`,
            a: `${fullName} is part of the Swagat Group of Institutions, which runs schools and campuses for regular and distance education across western Odisha.`,
        },
    ], [fullName, address, phone, email, programs, cbse, facilities, location, town])

    const structuredData = {
        ...seoData.structuredData,
        '@id': `${seoData.url}#school`,
        areaServed: location.split(',').slice(0, 2).map((name) => ({ '@type': 'Place', name: name.trim() })),
        hasMap: mapHref,
        sameAs: [...new Set([...(seoData.structuredData.sameAs || []), ...(officialSite ? [officialSite] : []), ...sameAs])],
        ...(photos.length > 0 && { image: photos.slice(0, 6).map((p) => p.src) }),
    }
    const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: fullName, item: seoData.url },
        ],
    }

    return (
        <>
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.url} />
                <meta property="og:image" content={seoData.image} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.image} />
                <meta name="geo.region" content="IN-OD" />
                <meta name="geo.placename" content={location} />
                <link rel="canonical" href={seoData.url} />
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
            </Helmet>

            <div>
                {/* Attention: who we are and where */}
                <section className="sw-deco-navy relative isolate overflow-hidden bg-sw-black text-sw-text-on-dark">
                    <span aria-hidden="true" className="absolute -left-16 top-1/3 -z-10 h-56 w-56 rounded-sw-pill bg-[rgb(var(--sw-sky)/0.18)] blur-2xl" />
                    <span aria-hidden="true" className="absolute -right-10 bottom-10 -z-10 h-64 w-64 rounded-sw-pill bg-[rgb(var(--sw-sun)/0.12)] blur-2xl" />
                    <div className="sw-container grid items-center gap-12 pb-16 pt-[calc(var(--sw-header-h)+2.5rem)] lg:grid-cols-[1.2fr_1fr] lg:pb-24 lg:pt-[calc(var(--sw-header-h)+4rem)]">
                        <div className="text-center lg:text-left">
                            <Badge tone="dark" className="mb-5">
                                <Icon icon={LuMapPin} size="xs" />
                                {location}
                            </Badge>
                            <h1 className="text-sw-display font-bold">
                                {schoolName},{' '}
                                <span className="sw-marker text-sw-black">{town}</span>
                            </h1>
                            <p className="mt-4 inline-flex items-center gap-2 text-sw-subtitle font-semibold text-[rgb(var(--sw-sun))]">
                                <Icon icon={LuSparkles} size="sm" /> A happy, caring place to learn and grow
                            </p>
                            <p className="mx-auto mt-4 max-w-2xl text-sw-body-lg text-sw-white/85 lg:mx-0">
                                {description}
                            </p>
                            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
                                <Button variant="inverse" size="lg" href="#programs" iconRight={LuArrowRight}>
                                    Explore classes
                                </Button>
                                {phone && (
                                    <Button variant="glass" size="lg" href={telHref} iconRight={LuPhone}>
                                        Call the school
                                    </Button>
                                )}
                            </div>
                        </div>
                        <HeroArch photo={photos[0]} town={town} schoolName={schoolName} sealText={`${schoolName.toUpperCase()} • ${town.toUpperCase()} • `} />
                    </div>
                </section>

                {/* Quick facts strip */}
                <div className="relative z-10 -mt-6 overflow-hidden">
                    <div className="sw-marquee -rotate-1 bg-[rgb(var(--sw-sun))] py-3 text-sw-black shadow-sw-soft [--sw-marquee-duration:38s]">
                        {[0, 1].map((group) => (
                            <ul key={group} aria-hidden={group === 1 ? 'true' : undefined} className="sw-marquee-group gap-8 pr-8">
                                {facts.map((fact) => (
                                    <li key={fact} className="flex shrink-0 items-center gap-3 whitespace-nowrap text-sw-label font-bold">
                                        <Icon icon={LuStar} size="xs" /> {fact}
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>

                {/* Interest: why families choose the school */}
                <Section className="py-14 lg:py-20">
                    <Container>
                        <KidsHeading kicker={`Why families choose us`}>
                            Why choose {schoolName}, <span className="sw-marker sw-marker-sky">{town}</span>?
                        </KidsHeading>
                        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <li key={feature.title} className={cx('relative h-full overflow-hidden rounded-[28px] p-6 lg:p-7', FEATURE_TONES[index % FEATURE_TONES.length])}>
                                    <span aria-hidden="true" className="absolute -right-2 -top-4 font-sw-display text-[88px] font-extrabold leading-none text-sw-black/[0.07]">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span aria-hidden="true" className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-sw-white text-[rgb(var(--sw-accent-blue))] shadow-sw-soft">
                                        <Icon icon={feature.icon} size="md" />
                                    </span>
                                    <h3 className="mb-2 text-sw-h3 font-bold">{feature.title}</h3>
                                    <p className="text-sw-body text-sw-text-secondary">{feature.description}</p>
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>

                {/* Programs */}
                <Section id="programs" className="sw-deco-sky scroll-mt-sw-header py-14 lg:py-20">
                    <Container>
                        <KidsHeading
                            kicker="Classes"
                            subtitle="Comprehensive educational programs designed to nurture young minds and prepare them for the future"
                        >
                            Our <span className="sw-marker">Programs</span>
                        </KidsHeading>
                        <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {programs.map((program, index) => {
                                const tone = PROGRAM_TONES[index % PROGRAM_TONES.length]
                                return (
                                    <li key={program.name} className="flex h-full flex-col overflow-hidden rounded-[28px] bg-sw-white shadow-sw-soft ring-1 ring-sw-black/5 transition-transform duration-sw ease-sw motion-safe:hover:-translate-y-1">
                                        <div className={cx('relative flex items-center justify-between px-6 py-5', tone.band)}>
                                            <span className="font-sw-display text-5xl font-extrabold leading-none text-sw-black/80">{String(index + 1).padStart(2, '0')}</span>
                                            <span aria-hidden="true" className="flex h-14 w-14 rotate-6 items-center justify-center rounded-[18px] bg-sw-white text-sw-black shadow-sw-soft">
                                                <Icon icon={program.icon} size="md" />
                                            </span>
                                        </div>
                                        <div className="flex flex-1 flex-col p-6">
                                            <h3 className="mb-2 text-sw-h3 font-bold">{program.name}</h3>
                                            <p className="mb-5 text-sw-body text-sw-text-secondary">{program.description}</p>
                                            <ul className="mt-auto flex flex-wrap gap-2" aria-label={`Subjects in ${program.name}`}>
                                                {program.subjects.map((subject) => (
                                                    <li key={subject} className={cx('rounded-sw-pill px-3 py-1.5 text-[13px] font-semibold text-sw-black', tone.chip)}>
                                                        {subject}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>
                                )
                            })}
                        </ol>
                    </Container>
                </Section>

                {/* Desire: real photos from this school */}
                {photos.length > 0 && (
                    <Section className="py-14 lg:py-20">
                        <Container>
                            <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
                                <KidsHeading kicker="Photo gallery" align="left">
                                    Moments from <span className="sw-marker">{town}</span>
                                </KidsHeading>
                                <Button variant="primary" size="lg" to="/gallery" iconRight={LuCamera} className="md:mb-10">
                                    See the full gallery
                                </Button>
                            </div>
                            <PhotoGrid photos={photos.slice(0, 8)} context={fullName} featureFirst />
                        </Container>
                    </Section>
                )}

                {/* Facilities */}
                <Section className={cx('py-14 lg:py-20', photos.length > 0 && 'sw-deco-sky')}>
                    <Container>
                        <KidsHeading kicker="Facilities">
                            Facilities your child <span className="sw-marker sw-marker-sky">uses every day</span>
                        </KidsHeading>
                        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {facilities.map((facility, index) => (
                                <li key={facility.name} className="h-full rounded-[24px] bg-sw-white p-5 text-center shadow-sw-soft ring-1 ring-sw-black/5">
                                    <span aria-hidden="true" className={cx('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-sw-pill text-sw-black', FACILITY_TONES[index % FACILITY_TONES.length], index % 2 ? 'rotate-6' : '-rotate-6')}>
                                        <Icon icon={facility.icon} size="md" />
                                    </span>
                                    <h3 className="mb-1 text-sw-label font-bold">{facility.name}</h3>
                                    <p className="text-sw-small font-normal text-sw-text-secondary">{facility.description}</p>
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>

                {/* Achievements */}
                <Section tone="dark" className="py-14 lg:py-20">
                    <Container>
                        <KidsHeading kicker="Proud moments" tone="dark">
                            Our <span className="sw-marker text-sw-black">Achievements</span>
                        </KidsHeading>
                        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {achievements.map((achievement) => (
                                <li key={achievement.title} className="sw-deco-card h-full rounded-[28px] bg-sw-white/5 p-6 ring-1 ring-inset ring-sw-white/10">
                                    <span aria-hidden="true" className="mb-4 flex h-12 w-12 items-center justify-center rounded-[16px] bg-[rgb(var(--sw-sun))] text-sw-black">
                                        <Icon icon={achievement.icon} size="md" />
                                    </span>
                                    <h3 className="mb-2 text-sw-h3 font-bold">{achievement.title}</h3>
                                    <p className="text-sw-body text-sw-text-on-dark-secondary">{achievement.description}</p>
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>

                {/* Questions parents ask (mirrored in FAQPage data) */}
                <FaqSection
                    title={`Questions parents ask about ${fullName}`}
                    subtitle="Quick answers about the school, its classes and admission."
                    items={faqs}
                    path={path}
                    className="sw-deco-sky"
                />

                {/* Action */}
                <Section id="contact" className="scroll-mt-sw-header py-14 lg:py-20">
                    <Container>
                        <div className="relative overflow-hidden rounded-[36px] bg-[rgb(var(--sw-accent-blue))] px-6 py-12 text-center text-sw-white sm:px-10 lg:py-16">
                            <span aria-hidden="true" className="absolute -left-10 -top-10 h-40 w-40 rounded-sw-pill bg-sw-white/10" />
                            <span aria-hidden="true" className="absolute -bottom-12 -right-6 h-48 w-48 rounded-sw-pill bg-[rgb(var(--sw-sun)/0.25)]" />
                            <div className="relative">
                                <h2 className="text-sw-display-alt font-bold">
                                    Come and meet us in <span className="sw-marker text-sw-black">{town}</span>
                                </h2>
                                <p className="mx-auto mt-4 max-w-2xl text-sw-subtitle text-sw-white/85">
                                    Bring your child, see the classrooms and talk to the teachers. We will answer every question about classes, fees and admission.
                                </p>
                                <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 text-left md:grid-cols-3">
                                    {contactInfo.map((info) => (
                                        <li key={info.title} className="flex gap-4 rounded-[22px] bg-sw-white p-5 text-sw-black">
                                            <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sw-pill bg-sw-badge-blue text-[rgb(var(--sw-accent-blue))]">
                                                <Icon icon={info.icon} size="sm" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-sw-label font-bold">{info.title}</span>
                                                <span className="block break-words text-sw-body text-sw-text-secondary">{info.value}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-10 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
                                    {phone && <Button variant="inverse" size="lg" href={telHref} iconRight={LuPhone}>Call {phone}</Button>}
                                    <Button variant="frost" size="lg" href={mapHref} target="_blank" rel="noopener noreferrer" iconRight={LuNavigation}>Get directions</Button>
                                    {email && <Button variant="frost" size="lg" href={`mailto:${email}`} iconRight={LuMail}>Email us</Button>}
                                </div>
                                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    {officialSite && (
                                        <Button variant="ghost" size="md" href={officialSite} target="_blank" rel="noopener" iconRight={LuExternalLink} className="text-sw-white underline underline-offset-4">
                                            The school&apos;s own website
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="md" href="/" iconRight={LuArrowRight} className="text-sw-white underline underline-offset-4">
                                        Visit Main Website
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Container>
                </Section>
            </div>
        </>
    )
}

export default SchoolPageTemplate
