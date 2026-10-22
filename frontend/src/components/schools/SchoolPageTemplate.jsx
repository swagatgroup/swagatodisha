import {useEffect} from 'react';
import { LuCheck, LuMapPin } from 'react-icons/lu'
import { Helmet } from 'react-helmet-async'
import { Container, Section, SectionHeader } from '../site/Layout'
import Badge from '../site/Badge'
import Button from '../site/Button'
import Card from '../site/Card'
import Icon from '../site/Icon'
import SmartImage from '../site/SmartImage'

const SchoolPageTemplate = ({
    schoolName,
    location,
    description,
    features,
    programs,
    facilities,
    achievements,
    contactInfo,
    seoData
}) => {
    useEffect(() => {
        // Smooth scroll to top on page load
        window.scrollTo(0, 0)
    }, [])

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
                <link rel="canonical" href={seoData.url} />
                <script type="application/ld+json">
                    {JSON.stringify(seoData.structuredData)}
                </script>
            </Helmet>

            <div>
                {/* Hero Section */}
                <section className="relative isolate overflow-hidden bg-sw-ink text-sw-white">
                    <SmartImage
                        src="/images/redesign/school-hero-desktop.webp"
                        mobileSrc="/images/redesign/school-hero-mobile.webp"
                        alt=""
                        width={2880}
                        height={1600}
                        priority
                        placeholder="night"
                        className="absolute inset-0 -z-20"
                    />
                    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-sw-black/55" />
                    <div className="sw-container flex min-h-[560px] flex-col items-center justify-center pb-16 pt-[calc(var(--sw-header-h)+3rem)] text-center lg:min-h-[720px]">
                        <Badge tone="dark" className="mb-5">
                            <Icon icon={LuMapPin} size="xs" />
                            {location}
                        </Badge>

                        <h1 className="text-sw-display font-bold">
                            {schoolName}
                        </h1>

                        <p className="mx-auto mt-5 max-w-3xl text-sw-subtitle text-sw-white/85">
                            {description}
                        </p>

                        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                            <Button variant="frost" size="lg" href="#programs">
                                Explore Programs
                            </Button>
                            <Button variant="glass" size="lg" href="#contact">
                                Contact Us
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <Section tone="muted">
                    <Container>
                        <SectionHeader title={`Why Choose ${schoolName}?`} />
                        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <li key={index}>
                                    <Card variant="outline" className="h-full p-6">
                                        <span aria-hidden="true" className="mb-4 flex h-12 w-12 items-center justify-center rounded-sw-sm bg-sw-black text-sw-h3">{feature.icon}</span>
                                        <h3 className="mb-2 text-sw-h3 font-bold">{feature.title}</h3>
                                        <p className="text-sw-body text-sw-text-secondary">{feature.description}</p>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>

                {/* Programs Section */}
                <Section id="programs" className="scroll-mt-sw-header">
                    <Container>
                        <SectionHeader
                            title="Our Programs"
                            subtitle="Comprehensive educational programs designed to nurture young minds and prepare them for the future"
                        />
                        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {programs.map((program, index) => (
                                <li key={index}>
                                    <Card className="h-full p-6">
                                        <span aria-hidden="true" className="sw-pane sw-pane-career mb-4 flex h-12 w-12 items-center justify-center rounded-sw-sm text-sw-h3">{program.icon}</span>
                                        <h3 className="mb-2 text-sw-h3 font-bold">{program.name}</h3>
                                        <p className="mb-4 text-sw-body text-sw-text-on-dark-secondary">{program.description}</p>
                                        <ul className="space-y-2">
                                            {program.subjects.map((subject, subIndex) => (
                                                <li key={subIndex} className="flex items-center gap-2 text-sw-body">
                                                    <Icon icon={LuCheck} size="xs" className="shrink-0" />
                                                    {subject}
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>

                {/* Facilities Section */}
                <Section tone="muted">
                    <Container>
                        <SectionHeader title="World-Class Facilities" />
                        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {facilities.map((facility, index) => (
                                <li key={index}>
                                    <Card variant="outline" className="h-full p-5 text-center">
                                        <span aria-hidden="true" className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-sw-pill bg-sw-black text-sw-h3">{facility.icon}</span>
                                        <h3 className="mb-1 text-sw-label font-bold">{facility.name}</h3>
                                        <p className="text-sw-small font-normal text-sw-text-secondary">{facility.description}</p>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>

                {/* Achievements Section */}
                <Section>
                    <Container>
                        <SectionHeader title="Our Achievements" />
                        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {achievements.map((achievement, index) => (
                                <li key={index}>
                                    <Card variant="panel" className="h-full p-6">
                                        <span aria-hidden="true" className="mb-4 flex h-12 w-12 items-center justify-center rounded-sw-sm bg-sw-badge-peach text-sw-h3">{achievement.icon}</span>
                                        <h3 className="mb-2 text-sw-h3 font-bold">{achievement.title}</h3>
                                        <p className="text-sw-body text-sw-text-secondary">{achievement.description}</p>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>

                {/* Contact Section */}
                <Section id="contact" tone="dark" className="scroll-mt-sw-header">
                    <Container className="text-center">
                        <SectionHeader tone="dark" title="Get In Touch" subtitle="Ready to join our educational community? Contact us today!" />
                        <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                            {contactInfo.map((info, index) => (
                                <li key={index} className="rounded-sw-md bg-sw-white/5 p-6 ring-1 ring-sw-white/10">
                                    <span aria-hidden="true" className="mb-3 block text-sw-h2">{info.icon}</span>
                                    <h3 className="mb-1 text-sw-label font-bold">{info.title}</h3>
                                    <p className="break-words text-sw-body text-sw-text-on-dark-secondary">{info.value}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-12">
                            <Button variant="inverse" size="lg" href="/">
                                Visit Main Website
                            </Button>
                        </div>
                    </Container>
                </Section>
            </div>
        </>
    )
}

export default SchoolPageTemplate
