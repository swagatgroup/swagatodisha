import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CONTACT_INFO } from '../../utils/constants'
import {
    RiAtomLine,
    RiBookLine,
    RiBriefcaseLine,
    RiBrushLine,
    RiCoinsLine,
    RiComputerLine,
    RiFlaskLine,
    RiGroupLine,
    RiHammerLine,
    RiHeartPulseLine,
    RiLineChartLine,
    RiMegaphoneLine,
    RiPaletteLine,
    RiSettings3Line,
    RiStethoscopeLine,
    RiToolsLine
} from '@remixicon/react'
import { LuArrowUpRight, LuChevronDown, LuChevronRight, LuCompass, LuGraduationCap, LuPhone } from 'react-icons/lu'
import { Container, SectionHeader } from '../site/Layout'
import Badge from '../site/Badge'
import Button from '../site/Button'
import Icon from '../site/Icon'
import Modal from '../site/Modal'
import { cx } from '../site/cx'

// Career roadmap after 10th: stream cards on the homepage, full stepped tree in a modal.
// Footer "Career Guidance" opens it with /?explore=career#career-roadmap
const CareerRoadmap = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [expandedBranches, setExpandedBranches] = useState(new Set())
    const [expandedPaths, setExpandedPaths] = useState(new Set())
    const [showAllCareers, setShowAllCareers] = useState(new Set())
    const { search, key: locationKey } = useLocation()
    useEffect(() => {
        if (new URLSearchParams(search).get('explore') === 'career') {
            setIsOpen(true)
        }
    }, [search, locationKey])

    // Open the roadmap with one stream already expanded
    const openStream = (key) => {
        setExpandedBranches(new Set([key]))
        setIsOpen(true)
    }

    // Tree interaction handlers
    const toggleBranch = (branchKey) => {
        setExpandedBranches(prev => {
            const newSet = new Set(prev)
            if (newSet.has(branchKey)) {
                newSet.delete(branchKey)
            } else {
                newSet.add(branchKey)
            }
            return newSet
        })
    }

    const togglePath = (pathKey) => {
        setExpandedPaths(prev => {
            const newSet = new Set(prev)
            if (newSet.has(pathKey)) {
                newSet.delete(pathKey)
            } else {
                newSet.add(pathKey)
            }
            return newSet
        })
    }

    const toggleShowAllCareers = (pathKey) => {
        setShowAllCareers(prev => {
            const newSet = new Set(prev)
            if (newSet.has(pathKey)) {
                newSet.delete(pathKey)
            } else {
                newSet.add(pathKey)
            }
            return newSet
        })
    }

    const handleCareerCounselingCall = () => {
        window.open(`tel:${CONTACT_INFO.phone}`, '_self')
    }

    // Comprehensive Career Options After 10th
    const careerOptions = {
        science: {
            title: "Science Stream",
            description: "Explore the world of science and technology",
            icon: RiFlaskLine,
            color: "from-blue-500 to-cyan-500",
            paths: [
                {
                    name: "Engineering",
                    icon: RiSettings3Line,
                    description: "Build the future with technology",
                    careers: [
                        { name: "Computer Science Engineering", duration: "4 years", scope: "Software Development, AI, Cybersecurity" },
                        { name: "Mechanical Engineering", duration: "4 years", scope: "Manufacturing, Automotive, Aerospace" },
                        { name: "Civil Engineering", duration: "4 years", scope: "Infrastructure, Construction, Urban Planning" },
                        { name: "Electrical Engineering", duration: "4 years", scope: "Power Systems, Electronics, Telecommunications" },
                        { name: "Biotechnology Engineering", duration: "4 years", scope: "Pharmaceuticals, Research, Healthcare" },
                        { name: "Chemical Engineering", duration: "4 years", scope: "Chemical Industry, Petrochemicals, Pharmaceuticals" },
                        { name: "Aerospace Engineering", duration: "4 years", scope: "Aircraft Design, Space Technology, Defense" },
                        { name: "Environmental Engineering", duration: "4 years", scope: "Pollution Control, Sustainability, Green Technology" },
                        { name: "Marine Engineering", duration: "4 years", scope: "Ship Design, Offshore Technology, Naval Architecture" },
                        { name: "Mining Engineering", duration: "4 years", scope: "Mineral Extraction, Mining Technology, Safety" }
                    ]
                },
                {
                    name: "Medical",
                    icon: RiStethoscopeLine,
                    description: "Heal and save lives",
                    careers: [
                        { name: "MBBS (Doctor)", duration: "5.5 years", scope: "Hospitals, Clinics, Research" },
                        { name: "BDS (Dentist)", duration: "5 years", scope: "Dental Clinics, Hospitals, Private Practice" },
                        { name: "B.Pharm (Pharmacist)", duration: "4 years", scope: "Pharmaceuticals, Hospitals, Research" },
                        { name: "B.Sc Nursing", duration: "4 years", scope: "Hospitals, Healthcare, Community Health" },
                        { name: "Physiotherapy", duration: "4.5 years", scope: "Rehabilitation Centers, Sports Medicine" },
                        { name: "Veterinary Science", duration: "5 years", scope: "Animal Healthcare, Research, Agriculture" },
                        { name: "Ayurveda", duration: "5.5 years", scope: "Traditional Medicine, Wellness Centers, Research" },
                        { name: "Homeopathy", duration: "5.5 years", scope: "Alternative Medicine, Private Practice, Research" },
                        { name: "Occupational Therapy", duration: "4 years", scope: "Rehabilitation, Mental Health, Community Care" },
                        { name: "Speech Therapy", duration: "4 years", scope: "Communication Disorders, Special Education, Healthcare" }
                    ]
                },
                {
                    name: "Pure Sciences",
                    icon: RiAtomLine,
                    description: "Discover the mysteries of nature",
                    careers: [
                        { name: "B.Sc Physics", duration: "3 years", scope: "Research, Teaching, Technology" },
                        { name: "B.Sc Chemistry", duration: "3 years", scope: "Chemical Industry, Research, Quality Control" },
                        { name: "B.Sc Mathematics", duration: "3 years", scope: "Data Science, Finance, Research" },
                        { name: "B.Sc Biology", duration: "3 years", scope: "Biotechnology, Environmental Science" },
                        { name: "B.Sc Computer Science", duration: "3 years", scope: "Software Development, IT, Data Analysis" },
                        { name: "B.Sc Statistics", duration: "3 years", scope: "Data Analysis, Research, Actuarial Science" },
                        { name: "B.Sc Geology", duration: "3 years", scope: "Mining, Environmental Studies, Research" },
                        { name: "B.Sc Environmental Science", duration: "3 years", scope: "Conservation, Research, Policy Making" },
                        { name: "B.Sc Agriculture", duration: "4 years", scope: "Farming, Research, Agribusiness" },
                        { name: "B.Sc Forensic Science", duration: "3 years", scope: "Crime Investigation, Law Enforcement, Research" }
                    ]
                }
            ]
        },
        commerce: {
            title: "Commerce Stream",
            description: "Master the world of business and finance",
            icon: RiLineChartLine,
            color: "from-green-500 to-emerald-500",
            paths: [
                {
                    name: "Business & Management",
                    icon: RiBriefcaseLine,
                    description: "Lead organizations to success",
                    careers: [
                        { name: "BBA (Business Administration)", duration: "3 years", scope: "Management, Entrepreneurship, Consulting" },
                        { name: "B.Com (Commerce)", duration: "3 years", scope: "Accounting, Finance, Banking" },
                        { name: "CA (Chartered Accountant)", duration: "4-5 years", scope: "Auditing, Taxation, Financial Advisory" },
                        { name: "CS (Company Secretary)", duration: "3-4 years", scope: "Corporate Governance, Legal Compliance" },
                        { name: "CMA (Cost Management)", duration: "3-4 years", scope: "Cost Analysis, Budgeting, Financial Planning" },
                        { name: "BBA in Finance", duration: "3 years", scope: "Investment Banking, Financial Analysis, Risk Management" },
                        { name: "BBA in Marketing", duration: "3 years", scope: "Brand Management, Digital Marketing, Sales" },
                        { name: "BBA in HR", duration: "3 years", scope: "Human Resources, Recruitment, Training" },
                        { name: "BBA in Operations", duration: "3 years", scope: "Supply Chain, Logistics, Process Management" },
                        { name: "BBA in International Business", duration: "3 years", scope: "Global Trade, Export-Import, International Marketing" }
                    ]
                },
                {
                    name: "Finance & Banking",
                    icon: RiCoinsLine,
                    description: "Navigate the financial world",
                    careers: [
                        { name: "Banking & Insurance", duration: "3 years", scope: "Banks, Insurance Companies, Financial Services" },
                        { name: "Investment Banking", duration: "3-4 years", scope: "Investment Firms, Stock Markets, Portfolio Management" },
                        { name: "Financial Planning", duration: "3 years", scope: "Financial Advisory, Wealth Management" },
                        { name: "Actuarial Science", duration: "3-4 years", scope: "Risk Assessment, Insurance, Pension Funds" },
                        { name: "Economics", duration: "3 years", scope: "Policy Making, Research, Economic Analysis" }
                    ]
                },
                {
                    name: "Marketing & Sales",
                    icon: RiMegaphoneLine,
                    description: "Connect products with people",
                    careers: [
                        { name: "Digital Marketing", duration: "3 years", scope: "Social Media, SEO, Content Marketing" },
                        { name: "Sales Management", duration: "3 years", scope: "Sales Teams, Business Development" },
                        { name: "Advertising", duration: "3 years", scope: "Creative Agencies, Brand Management" },
                        { name: "Retail Management", duration: "3 years", scope: "Retail Chains, E-commerce, Supply Chain" },
                        { name: "Public Relations", duration: "3 years", scope: "Corporate Communications, Media Relations" }
                    ]
                }
            ]
        },
        arts: {
            title: "Arts & Humanities",
            description: "Express creativity and understand society",
            icon: RiPaletteLine,
            color: "from-[#0E1A3D] to-[#004D98]",
            paths: [
                {
                    name: "Literature & Languages",
                    icon: RiBookLine,
                    description: "Master the power of words",
                    careers: [
                        { name: "English Literature", duration: "3 years", scope: "Teaching, Writing, Publishing, Media" },
                        { name: "Journalism & Mass Communication", duration: "3 years", scope: "News Media, Broadcasting, Digital Media" },
                        { name: "Foreign Languages", duration: "3 years", scope: "Translation, Diplomacy, International Business" },
                        { name: "Creative Writing", duration: "3 years", scope: "Content Creation, Scriptwriting, Publishing" },
                        { name: "Linguistics", duration: "3 years", scope: "Research, Language Technology, Education" }
                    ]
                },
                {
                    name: "Social Sciences",
                    icon: RiGroupLine,
                    description: "Understand human society",
                    careers: [
                        { name: "Psychology", duration: "3 years", scope: "Counseling, HR, Research, Clinical Practice" },
                        { name: "Sociology", duration: "3 years", scope: "Social Work, Research, Policy Making" },
                        { name: "Political Science", duration: "3 years", scope: "Government, Public Administration, Law" },
                        { name: "History", duration: "3 years", scope: "Teaching, Research, Museums, Archives" },
                        { name: "Geography", duration: "3 years", scope: "Urban Planning, Environmental Studies, GIS" }
                    ]
                },
                {
                    name: "Fine Arts & Design",
                    icon: RiBrushLine,
                    description: "Create visual masterpieces",
                    careers: [
                        { name: "Fine Arts", duration: "4 years", scope: "Artist, Art Teacher, Gallery Curator" },
                        { name: "Graphic Design", duration: "3-4 years", scope: "Advertising, Web Design, Branding" },
                        { name: "Fashion Design", duration: "4 years", scope: "Fashion Industry, Textile Design, Styling" },
                        { name: "Interior Design", duration: "4 years", scope: "Architecture, Real Estate, Event Design" },
                        { name: "Animation & Multimedia", duration: "3-4 years", scope: "Film Industry, Gaming, Advertising" }
                    ]
                }
            ]
        },
        vocational: {
            title: "Vocational & Technical",
            description: "Learn practical skills for immediate employment",
            icon: RiToolsLine,
            color: "from-orange-500 to-red-500",
            paths: [
                {
                    name: "IT & Computer",
                    icon: RiComputerLine,
                    description: "Master digital technology",
                    careers: [
                        { name: "Diploma in Computer Engineering", duration: "3 years", scope: "Software Development, IT Support, Networking" },
                        { name: "Web Development", duration: "1-2 years", scope: "Frontend/Backend Development, Freelancing" },
                        { name: "Cybersecurity", duration: "2-3 years", scope: "Information Security, Ethical Hacking" },
                        { name: "Data Analytics", duration: "1-2 years", scope: "Business Intelligence, Data Science" },
                        { name: "Digital Marketing", duration: "1-2 years", scope: "Social Media, SEO, Content Marketing" }
                    ]
                },
                {
                    name: "Healthcare & Paramedical",
                    icon: RiHeartPulseLine,
                    description: "Support healthcare professionals",
                    careers: [
                        { name: "Medical Lab Technology", duration: "2-3 years", scope: "Hospitals, Diagnostic Centers, Research" },
                        { name: "Radiology Technology", duration: "2-3 years", scope: "Hospitals, Imaging Centers, Equipment Operation" },
                        { name: "Physiotherapy Assistant", duration: "2 years", scope: "Rehabilitation Centers, Sports Medicine" },
                        { name: "Pharmacy Assistant", duration: "2 years", scope: "Pharmacies, Hospitals, Pharmaceutical Companies" },
                        { name: "Emergency Medical Services", duration: "1-2 years", scope: "Ambulance Services, Emergency Response" }
                    ]
                },
                {
                    name: "Skilled Trades",
                    icon: RiHammerLine,
                    description: "Master hands-on skills",
                    careers: [
                        { name: "Electrician", duration: "2-3 years", scope: "Construction, Maintenance, Industrial" },
                        { name: "Plumber", duration: "2 years", scope: "Construction, Maintenance, Service Industry" },
                        { name: "Welder", duration: "1-2 years", scope: "Manufacturing, Construction, Automotive" },
                        { name: "Automobile Mechanic", duration: "2-3 years", scope: "Auto Repair, Service Centers, Dealerships" },
                        { name: "Carpenter", duration: "2-3 years", scope: "Construction, Furniture Making, Interior Design" }
                    ]
                }
            ]
        }
    }

    return (
        <div className="sw-section relative bg-sw-white">
            <Container>
                <SectionHeader
                    id="career-roadmap-title"
                    title="Career Roadmap After 10th"
                    subtitle="Not sure which stream to choose? See where science, commerce, arts and vocational courses can take you, then talk to our counsellors for free guidance."
                />

                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(careerOptions).map(([key, stream]) => {
                        const StreamIcon = stream.icon
                        const careerCount = stream.paths.reduce((sum, path) => sum + path.careers.length, 0)
                        return (
                            <li key={key}>
                                <button
                                    type="button"
                                    onClick={() => openStream(key)}
                                    aria-haspopup="dialog"
                                    className="sw-deco-card group flex h-full w-full flex-col rounded-sw-md bg-sw-black p-4 text-left text-sw-white ring-2 ring-inset ring-sw-border-dark transition-transform duration-sw ease-sw motion-safe:hover:-translate-y-1"
                                >
                                    <span className="flex items-start justify-between gap-3">
                                        <span className="sw-pane sw-pane-career flex h-12 w-12 shrink-0 items-center justify-center rounded-sw-sm">
                                            <StreamIcon size={24} />
                                        </span>
                                        <Icon icon={LuArrowUpRight} size="md" strokeWidth={2.75} className="text-sw-gray-300 transition-transform duration-sw-fast motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
                                    </span>
                                    <span className="mt-4 block font-sw-display text-sw-label font-bold">{stream.title}</span>
                                    <span className="mt-1 block text-sw-small text-sw-text-on-dark-secondary">{stream.description}</span>
                                    <span className="mt-auto pt-3 text-sw-caption text-sw-text-on-dark-muted">
                                        {stream.paths.map((path) => path.name).join(' · ')} · {careerCount} careers
                                    </span>
                                </button>
                            </li>
                        )
                    })}
                </ul>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button onClick={() => setIsOpen(true)} iconLeft={LuCompass} aria-haspopup="dialog">
                        Explore the Full Roadmap
                    </Button>
                    <Button variant="outline" onClick={handleCareerCounselingCall} iconLeft={LuPhone}>
                        Call for Career Counselling
                    </Button>
                </div>
            </Container>

            {/* Career Roadmap Modal: stepped timeline of streams → paths → careers */}
            <Modal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                title="Career Roadmap After 10th"
                description="Explore diverse career paths and opportunities"
                size="xl"
            >
                {/* Root Node */}
                <div className="flex items-center gap-4 rounded-sw-md bg-sw-black p-5 text-sw-white">
                    <span className="sw-pane sw-pane-career flex h-14 w-14 shrink-0 items-center justify-center rounded-sw-sm">
                        <Icon icon={LuGraduationCap} size="lg" strokeWidth={1.5} />
                    </span>
                    <div>
                        <h3 className="text-sw-h3 font-bold">Career Tree</h3>
                        <p className="text-sw-body text-sw-text-on-dark-secondary">Choose Your Path After 10th</p>
                    </div>
                </div>

                {/* Main Branches */}
                <ol className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {Object.entries(careerOptions).map(([key, stream]) => {
                        const StreamIcon = stream.icon
                        const branchOpen = expandedBranches.has(key)
                        return (
                            <li key={key}>
                                {/* Main Branch Node */}
                                <button
                                    type="button"
                                    onClick={() => toggleBranch(key)}
                                    aria-expanded={branchOpen}
                                    className={cx(
                                        'flex w-full items-center gap-4 rounded-sw-md bg-sw-black p-4 text-left text-sw-white transition-shadow duration-sw-fast',
                                        branchOpen ? 'shadow-sw-offset' : 'hover:shadow-sw-soft'
                                    )}
                                >
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sw-sm bg-sw-white/10">
                                        <StreamIcon size={24} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sw-label font-bold">{stream.title}</span>
                                        <span className="block text-sw-small font-normal text-sw-text-on-dark-secondary">{stream.description}</span>
                                    </span>
                                    <Icon icon={LuChevronDown} size="sm" className={cx('shrink-0 transition-transform duration-sw', branchOpen && 'rotate-180')} />
                                </button>

                                {/* Sub-branches (Paths) */}
                                {branchOpen && (
                                    <ol className="ml-6 mt-4 space-y-4 border-l-2 border-sw-black pl-6">
                                        {stream.paths.map((path, pathIndex) => {
                                            const PathIcon = path.icon
                                            const pathKey = `${key}-${pathIndex}`
                                            const pathOpen = expandedPaths.has(pathKey)
                                            return (
                                                <li key={pathIndex} className="relative">
                                                    <span aria-hidden="true" className="absolute -left-[33px] top-5 h-4 w-4 rounded-sw-pill bg-sw-black ring-4 ring-sw-white" />
                                                    {/* Path Node */}
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePath(pathKey)}
                                                        aria-expanded={pathOpen}
                                                        className={cx(
                                                            'flex w-full items-center gap-3 rounded-sw-sm bg-sw-white p-3 text-left ring-1 transition-shadow duration-sw-fast',
                                                            pathOpen ? 'ring-sw-black shadow-sw-offset' : 'ring-sw-border-light hover:shadow-sw-soft'
                                                        )}
                                                    >
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sw-sm bg-sw-black text-sw-white">
                                                            <PathIcon size={18} />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block font-semibold">{path.name}</span>
                                                            <span className="block text-sw-caption text-sw-text-muted">{path.description}</span>
                                                        </span>
                                                        <Icon icon={LuChevronRight} size="sm" className={cx('shrink-0 transition-transform duration-sw', pathOpen && 'rotate-90')} />
                                                    </button>

                                                    {/* Career Options (Leaves) */}
                                                    {pathOpen && (
                                                        <ul className="mt-3 space-y-2">
                                                            {(showAllCareers.has(pathKey) ? path.careers : path.careers.slice(0, 3)).map((career, careerIndex) => (
                                                                <li key={careerIndex} className="flex items-start justify-between gap-3 rounded-sw-sm bg-sw-surface-muted p-3">
                                                                    <span className="min-w-0">
                                                                        <span className="block text-sw-small font-semibold">{career.name}</span>
                                                                        <span className="mt-1 block text-sw-caption text-sw-text-muted">{career.scope}</span>
                                                                    </span>
                                                                    <Badge tone="blue" className="shrink-0 whitespace-nowrap">{career.duration}</Badge>
                                                                </li>
                                                            ))}

                                                            {/* View More Button */}
                                                            {path.careers.length > 3 && (
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleShowAllCareers(pathKey)}
                                                                        className="inline-flex min-h-11 items-center gap-2 text-sw-small font-semibold underline-offset-4 hover:underline"
                                                                    >
                                                                        <Icon icon={LuChevronDown} size="xs" className={cx('transition-transform', showAllCareers.has(pathKey) && 'rotate-180')} />
                                                                        {showAllCareers.has(pathKey)
                                                                            ? 'Show Less'
                                                                            : `View ${path.careers.length - 3} More Options`
                                                                        }
                                                                    </button>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ol>
                                )}
                            </li>
                        )
                    })}
                </ol>

                {/* Call to Action */}
                <div className="mt-8 rounded-sw-md bg-sw-surface-muted p-6 text-center">
                    <h4 className="text-sw-h3 font-bold">Need Career Guidance?</h4>
                    <p className="mb-4 mt-1 text-sw-body text-sw-text-secondary">Our counselors are here to help you choose the right path</p>
                    <Button onClick={handleCareerCounselingCall} iconLeft={LuPhone}>
                        Call for Career Counseling
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

export default CareerRoadmap
