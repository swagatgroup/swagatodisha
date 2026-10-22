import React, { useState, useEffect } from 'react'
import axios from 'axios';
import {
    LuBuilding2,
    LuEye,
    LuGraduationCap,
    LuLaptop,
    LuLightbulb,
    LuShieldCheck,
    LuSprout,
    LuStar,
    LuTarget,
    LuTrophy,
    LuUsers,
} from 'react-icons/lu'
import PageHero from './site/PageHero'
import { Container, Section, SectionHeader } from './site/Layout'
import Badge from './site/Badge'
import Button from './site/Button'
import Card from './site/Card'
import Icon from './site/Icon'
import { cx } from './site/cx'

const AboutUsPage = () => {
    const [staffProfiles, setStaffProfiles] = useState([]);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_URL}/api/website-content`);
                if (res.data && res.data.data && res.data.data.staffProfiles) {
                    setStaffProfiles(res.data.data.staffProfiles.filter(s => s.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0)));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchContent();
    }, []);

    const milestones = [
        {
            year: '2021',
            title: 'Foundation',
            description: 'Swagat Group of Institutions was established with a vision to provide quality education',
            icon: 'fa-solid fa-seedling'
        },
        {
            year: '2022',
            title: 'Expansion',
            description: 'Added multiple institutions and programs to serve diverse educational needs',
            icon: 'fa-solid fa-building'
        },
        {
            year: '2023',
            title: 'Recognition',
            description: 'Received multiple awards and recognitions for excellence in education',
            icon: 'fa-solid fa-trophy'
        },
        {
            year: '2024',
            title: 'Innovation',
            description: 'Introduced cutting-edge technology and modern teaching methodologies',
            icon: 'fa-solid fa-lightbulb'
        }
    ]

    const values = [
        {
            title: 'Excellence',
            description: 'We strive for excellence in everything we do, from academics to student development',
            icon: 'fa-solid fa-star',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            title: 'Innovation',
            description: 'Embracing new technologies and methodologies to enhance learning experiences',
            icon: 'fa-solid fa-lightbulb',
            color: 'from-blue-500 to-indigo-500'
        },
        {
            title: 'Integrity',
            description: 'Maintaining the highest standards of honesty and ethical behavior',
            icon: 'fa-solid fa-shield-check',
            color: 'from-green-500 to-teal-500'
        },
        {
            title: 'Community',
            description: 'Building strong relationships with students, parents, and the community',
            icon: 'fa-solid fa-users',
            color: 'from-[#4A1D7A] to-[#6B3F99]'
        }
    ]

    const team = [
        {
            name: 'Mr. G. Meher',
            position: 'Chairman',
            image: '/chairman.jpg',
            description: 'Visionary leader with over 20 years of experience in education'
        },
        {
            name: 'Mr. R.K. Meher',
            position: 'Trustee',
            image: '/chairman_rk.jpg',
            description: 'Dedicated trustee committed to educational excellence'
        },
        {
            name: 'Mrs. Manjula Meher',
            position: 'Principal',
            image: '/mnt_003.jpg',
            description: 'Experienced educator focused on student success'
        }
    ]

    // Font Awesome class names in the data above → Lucide glyphs
    const ICONS = {
        'fa-solid fa-seedling': LuSprout,
        'fa-solid fa-building': LuBuilding2,
        'fa-solid fa-trophy': LuTrophy,
        'fa-solid fa-lightbulb': LuLightbulb,
        'fa-solid fa-star': LuStar,
        'fa-solid fa-shield-check': LuShieldCheck,
        'fa-solid fa-users': LuUsers,
    }

    return (
        <div>
            {/* Hero Section */}
            <PageHero
                title="About Us"
                intro="Swagat Group of Institutions is a premier educational organization committed to providing quality education and fostering innovation in learning. We believe in empowering students to achieve their dreams through comprehensive education and personal development."
            />

            {/* Mission & Vision Section */}
            <Section>
                <Container className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
                    <Card className="p-6 lg:p-8">
                        <span className="sw-pane sw-pane-career mb-5 flex h-14 w-14 items-center justify-center rounded-sw-sm">
                            <Icon icon={LuTarget} size="md" />
                        </span>
                        <h2 className="mb-3 text-sw-h2 font-bold">Our Mission</h2>
                        <p className="text-sw-body text-sw-text-on-dark-secondary">
                            To provide world-class education that empowers students with knowledge, skills, and values
                            necessary to become responsible global citizens and successful professionals.
                        </p>
                    </Card>
                    <Card className="p-6 lg:p-8">
                        <span className="sw-pane sw-pane-timetable mb-5 flex h-14 w-14 items-center justify-center rounded-sw-sm">
                            <Icon icon={LuEye} size="md" />
                        </span>
                        <h2 className="mb-3 text-sw-h2 font-bold">Our Vision</h2>
                        <p className="text-sw-body text-sw-text-on-dark-secondary">
                            To be a leading educational institution recognized for academic excellence, innovation,
                            and commitment to student success, shaping the future of education in India.
                        </p>
                    </Card>
                </Container>
            </Section>

            {/* Values Section */}
            <Section tone="muted">
                <Container>
                    <SectionHeader title="Our Values" subtitle="The core principles that guide our institution and shape our educational approach." />
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map((value, index) => (
                            <li key={index}>
                                <Card variant="outline" className="h-full p-5">
                                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-sw-pill bg-sw-black text-sw-white">
                                        <Icon icon={ICONS[value.icon] || LuStar} size="sm" />
                                    </span>
                                    <h3 className="mb-2 text-sw-h3 font-bold">{value.title}</h3>
                                    <p className="text-sw-body text-sw-text-secondary">{value.description}</p>
                                </Card>
                            </li>
                        ))}
                    </ul>
                </Container>
            </Section>

            {/* Milestones Section */}
            <Section>
                <Container>
                    <SectionHeader title="Our Journey" subtitle="Key milestones that mark our growth and success in the field of education." />
                    <ol className="relative ml-3 space-y-8 border-l-[3px] border-sw-black pl-8 md:ml-0 md:border-l-0 md:pl-0">
                        {/* Centre line on wider screens */}
                        <span aria-hidden="true" className="absolute bottom-0 left-1/2 top-0 hidden w-[3px] -translate-x-1/2 bg-sw-black md:block" />
                        {milestones.map((milestone, index) => (
                            <li key={index} className={cx('relative md:flex md:items-center', index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse')}>
                                <div className="md:w-1/2 md:px-10">
                                    <Card variant="outline" className={cx('p-5', index % 2 === 0 ? 'md:text-right' : 'md:text-left')}>
                                        <span className={cx('mb-3 inline-flex h-11 w-11 items-center justify-center rounded-sw-sm bg-sw-black text-sw-white')}>
                                            <Icon icon={ICONS[milestone.icon] || LuStar} size="sm" />
                                        </span>
                                        <h3 className="mb-1 text-sw-h3 font-bold">{milestone.title}</h3>
                                        <p className="text-sw-body text-sw-text-secondary">{milestone.description}</p>
                                    </Card>
                                </div>
                                <span className="absolute -left-[52px] top-5 z-10 flex h-10 w-10 items-center justify-center rounded-sw-pill bg-sw-black text-sw-caption font-bold text-sw-white ring-4 ring-sw-white md:static md:h-14 md:w-14 md:shrink-0">
                                    {milestone.year}
                                </span>
                                <div className="hidden md:block md:w-1/2" />
                            </li>
                        ))}
                    </ol>
                </Container>
            </Section>

            {/* Team Section */}
            <Section tone="muted">
                <Container>
                    <SectionHeader title="Leadership Team" subtitle="Meet the dedicated leaders who guide our institution towards excellence." />
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {team.map((member, index) => (
                            <li key={index}>
                                <Card className="h-full p-6 text-center">
                                    <span className="sw-ph-night mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-sw-pill text-sw-h2 font-bold before:content-[attr(data-initial)]">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.dataset.initial = member.name.replace(/^(Mrs|Mr|Ms|Dr)\.?\s*/, '').charAt(0); }}
                                        />
                                    </span>
                                    <h3 className="mb-1 text-sw-h3 font-bold">{member.name}</h3>
                                    <p className="mb-3"><Badge tone="dark">{member.position}</Badge></p>
                                    <p className="text-sw-body text-sw-text-on-dark-secondary">{member.description}</p>
                                </Card>
                            </li>
                        ))}
                    </ul>
                </Container>
            </Section>

            {/* Why Choose Us Section */}
            <Section>
                <Container className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <h2 className="mb-8 font-sw-display text-sw-display-alt font-bold">Why Choose Us</h2>
                        <ul className="space-y-6">
                            {[
                                { icon: LuGraduationCap, title: 'Quality Education', text: 'We provide world-class education with modern curriculum and experienced faculty.' },
                                { icon: LuUsers, title: 'Personal Attention', text: 'Small class sizes ensure individual attention and personalized learning experiences.' },
                                { icon: LuLaptop, title: 'Modern Facilities', text: 'State-of-the-art infrastructure with latest technology and learning resources.' },
                            ].map((item) => (
                                <li key={item.title} className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sw-pill bg-sw-black text-sw-white">
                                        <Icon icon={item.icon} size="sm" />
                                    </span>
                                    <div>
                                        <h3 className="mb-1 text-sw-h3 font-bold">{item.title}</h3>
                                        <p className="text-sw-body text-sw-text-secondary">{item.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Card variant="panel" className="p-6 lg:p-8">
                        <h3 className="mb-5 text-sw-h3 font-bold">Our Achievements</h3>
                        <ul className="space-y-3">
                            {[
                                { icon: LuTrophy, tone: 'peach', title: 'Multiple Awards', text: 'Recognized for excellence in education' },
                                { icon: LuUsers, tone: 'blue', title: '1000+ Students', text: 'Successfully educated students' },
                                { icon: LuStar, tone: 'lavender', title: 'High Satisfaction', text: '95% student satisfaction rate' },
                            ].map((item) => (
                                <li key={item.title} className="flex items-center gap-4 rounded-sw-sm bg-sw-white p-4 shadow-sw-input">
                                    <Badge tone={item.tone} className="h-11 w-11 shrink-0 justify-center p-0">
                                        <Icon icon={item.icon} size="sm" />
                                    </Badge>
                                    <div>
                                        <h4 className="font-semibold">{item.title}</h4>
                                        <p className="text-sw-small font-normal text-sw-text-secondary">{item.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Container>
            </Section>

            {/* CTA Section */}
            <Section tone="dark">
                <Container className="text-center">
                    <h2 className="text-sw-display font-bold">Join Our Educational Journey</h2>
                    <p className="mx-auto mb-8 mt-4 max-w-3xl text-sw-subtitle text-sw-text-on-dark-secondary">
                        Be part of an institution that values excellence, innovation, and student success.
                        Start your educational journey with us today.
                    </p>
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Button variant="inverse" size="lg" to="/register">Apply Now</Button>
                        <Button variant="glass" size="lg" to="/#institutions">Learn More<span className="sr-only"> about our institutions</span></Button>
                    </div>
                </Container>
            </Section>

            {/* Staff Profiles Section */}
            {staffProfiles.length > 0 && (
                <Section>
                    <Container>
                        <SectionHeader title="Our Team" />
                        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
                            {staffProfiles.map((staff, idx) => (
                                <li key={idx}>
                                    <Card variant="soft" className="h-full p-5 text-center">
                                        <img
                                            src={staff.image || '/Swagat_Favicon.png'}
                                            alt={staff.name}
                                            loading="lazy"
                                            className="mx-auto mb-4 h-24 w-24 rounded-sw-pill object-cover ring-4 ring-sw-gray-50"
                                        />
                                        <h3 className="mb-1 text-sw-label font-bold">{staff.name}</h3>
                                        <p className="text-sw-small font-normal text-sw-text-muted">{staff.designation}</p>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </Container>
                </Section>
            )}
        </div>
    )
}

export default AboutUsPage
