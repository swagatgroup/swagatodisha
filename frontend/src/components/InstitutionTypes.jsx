import {useState, useCallback, useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import {
    RiSchoolLine,
    RiGraduationCapLine,
    RiBuildingLine,
    RiBriefcaseLine,
    RiHospitalLine,
    RiSettings3Line,
    RiTeamLine,
    RiComputerLine,
} from '@remixicon/react'
import { LuChevronRight, LuExternalLink, LuGlobe, LuLayers, LuPlus } from 'react-icons/lu'
import { Container, SectionHeader } from './site/Layout'
import Badge from './site/Badge'
import Button from './site/Button'
import Icon from './site/Icon'
import Modal from './site/Modal'
import { INSTITUTIONS } from '../data/institutions'

// Map of old FA icon strings → Remix Icon components
const ICON_MAP = {
    'fa-solid fa-school':               <RiSchoolLine size={44} className="text-white" />,
    'fa-solid fa-graduation-cap':       <RiGraduationCapLine size={44} className="text-white" />,
    'fa-solid fa-university':           <RiBuildingLine size={44} className="text-white" />,
    'fa-solid fa-briefcase':            <RiBriefcaseLine size={44} className="text-white" />,
    'fa-solid fa-heart-pulse':          <RiHospitalLine size={44} className="text-white" />,
    'fa-solid fa-cogs':                 <RiSettings3Line size={44} className="text-white" />,
    'fa-solid fa-chalkboard-teacher':   <RiTeamLine size={44} className="text-white" />,
    'fa-solid fa-laptop-code':          <RiComputerLine size={44} className="text-white" />,
}

const INSTITUTION_PANES = ['sw-pane-timetable', 'sw-pane-career', 'sw-pane-notice', 'sw-pane-result']

const InstitutionTypes = () => {
    const navigate = useNavigate()
    const [selectedInstitution, setSelectedInstitution] = useState(null)
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubModalOpen, setIsSubModalOpen] = useState(false)
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)

    // Debug useEffect to monitor state changes
    useEffect(() => {
        // State changed
    }, [isModalOpen, selectedInstitution, isSubModalOpen, selectedProgram, isCourseModalOpen, selectedCourse])

    const institutions = INSTITUTIONS

    // Footer program links open the matching institution: /?institution=<id>#institutions
    const { search, key: locationKey } = useLocation()
    useEffect(() => {
        const requested = new URLSearchParams(search).get('institution')
        const match = institutions.find((institution) => institution.id === requested)
        if (match) {
            setSelectedInstitution(match)
            setIsModalOpen(true)
        }
        // institutions is static data; re-run only when the URL changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, locationKey])

    // COMPLETELY REWRITTEN MODAL LOGIC FROM SCRATCH
    const handleInstitutionCardClick = useCallback((event, institution) => {
        // Prevent default behavior and stop propagation
        event.preventDefault()
        event.stopPropagation()

        // Institution card clicked

        // Set the selected institution and open modal
        setSelectedInstitution(institution)
        setIsModalOpen(true)

        // Reset all other modal states
        setSelectedProgram(null)
        setIsSubModalOpen(false)
        setSelectedCourse(null)
        setIsCourseModalOpen(false)

        // Modal opened
    }, [isModalOpen, selectedInstitution])

    const handleProgramCardClick = useCallback((event, program) => {
        // Prevent default behavior and stop propagation
        event.preventDefault()
        event.stopPropagation()

        // Program card clicked

        // Set the selected program and open sub modal
        setSelectedProgram(program)
        setIsSubModalOpen(true)

        // Reset course modal state
        setSelectedCourse(null)
        setIsCourseModalOpen(false)

        // Sub modal opened
    }, [])

    const handleCourseCardClick = useCallback((event, course) => {
        // Prevent default behavior and stop propagation
        event.preventDefault()
        event.stopPropagation()

        // Course card clicked

        // Set the selected course and open course modal
        setSelectedCourse(course)
        setIsCourseModalOpen(true)

        // Course modal opened
    }, [])

    const handleMainModalClose = useCallback((event) => {
        // Only close if clicking on backdrop, not on modal content
        if (event.target === event.currentTarget) {
            // Closing main modal - backdrop clicked
            setIsModalOpen(false)
            setSelectedInstitution(null)
            setSelectedProgram(null)
            setIsSubModalOpen(false)
            setSelectedCourse(null)
            setIsCourseModalOpen(false)
        } else {
            // Modal close prevented - clicked on modal content
        }
    }, [])

    const handleSubModalClose = useCallback((event) => {
        // Only close if clicking on backdrop, not on modal content
        if (event.target === event.currentTarget) {
            // Closing sub modal - backdrop clicked
            setIsSubModalOpen(false)
            setSelectedProgram(null)
            setSelectedCourse(null)
            setIsCourseModalOpen(false)
        }
    }, [])

    const handleCourseModalClose = useCallback((event) => {
        // Only close if clicking on backdrop, not on modal content
        if (event.target === event.currentTarget) {
            // Closing course modal - backdrop clicked
            setIsCourseModalOpen(false)
            setSelectedCourse(null)
        }
    }, [])

    const handleCloseButtonClick = useCallback((event, modalType) => {
        // Prevent event bubbling
        event.preventDefault()
        event.stopPropagation()

        if (modalType === 'main') {
            // Closing main modal - close button clicked
            setIsModalOpen(false)
            setSelectedInstitution(null)
            setSelectedProgram(null)
            setIsSubModalOpen(false)
            setSelectedCourse(null)
            setIsCourseModalOpen(false)
        } else if (modalType === 'sub') {
            // Closing sub modal - close button clicked
            setIsSubModalOpen(false)
            setSelectedProgram(null)
            setSelectedCourse(null)
            setIsCourseModalOpen(false)
        } else if (modalType === 'course') {
            // Closing course modal - close button clicked
            setIsCourseModalOpen(false)
            setSelectedCourse(null)
        }
    }, [])

    const programCard =
        'flex w-full items-start justify-between gap-4 rounded-sw-sm bg-sw-white p-4 text-left ring-1 ring-sw-border-light shadow-sw-soft transition-[box-shadow,transform] duration-sw-fast ease-sw hover:shadow-sw-offset motion-safe:hover:-translate-y-0.5'
    const formatFeeKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())

    return (
        <div className="sw-deco-light flex min-h-[min(calc(100svh-var(--sw-header-h)),660px)] flex-col justify-center py-5 md:py-6">
            <Container className="flex w-full flex-1 flex-col justify-center">
                <SectionHeader id="institutions-title" title="Our Institutions" subtitle="Diverse pathways to academic excellence." className="!mb-4 md:!mb-6" />

                {/* All eight fit one screen: 2 x 4 on phones, 4 x 2 from 900px */}
                <ul className="grid max-h-[540px] flex-1 auto-rows-fr grid-cols-2 gap-3 sm:gap-4 min-[900px]:grid-cols-4 lg:gap-5">
                    {institutions.map((institution, index) => (
                        <li key={institution.id} className="min-h-0">
                            <button
                                type="button"
                                onClick={(event) => handleInstitutionCardClick(event, institution)}
                                aria-label={`${institution.name}: view programs`}
                                className="sw-deco-card group flex h-full w-full flex-col rounded-sw-md bg-sw-black p-2 text-left [@media(max-height:600px)]:flex-row [@media(max-height:600px)]:items-center [@media(max-height:600px)]:gap-2 text-sw-text-on-dark ring-2 ring-inset ring-sw-border-dark transition-transform duration-sw ease-sw motion-safe:hover:-translate-y-1 sm:p-3"
                            >
                                <span className={`sw-pane relative flex min-h-0 w-full flex-1 items-center justify-center rounded-sw-sm [@media(max-height:600px)]:h-9 [@media(max-height:600px)]:w-9 [@media(max-height:600px)]:flex-none ${INSTITUTION_PANES[index % INSTITUTION_PANES.length]}`}>
                                    {ICON_MAP[institution.icon]}
                                    <Icon icon={LuPlus} size="sm" strokeWidth={2.75} className="absolute right-1.5 top-1.5 text-sw-white transition-transform duration-sw ease-sw group-hover:rotate-90 [@media(max-height:600px)]:hidden" />
                                </span>
                                <span className="mt-1.5 block text-sw-small font-semibold leading-tight text-sw-white sm:mt-2 sm:text-sw-label min-[900px]:min-h-[2.5em] [@media(max-height:600px)]:mt-0 [@media(max-height:600px)]:min-h-0">{institution.name}</span>
                                <span className="mt-0.5 hidden text-sw-caption leading-tight text-sw-text-on-dark-muted min-[900px]:min-h-[2.5em] [@media(min-height:700px)]:block">{institution.subtitle}</span>
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 flex justify-center md:mt-6">
                    <Button to="/courses" variant="outline" size="sm" iconRight={LuChevronRight}>
                        View All Courses &amp; Fees
                    </Button>
                </div>
            </Container>

            {/* MAIN MODAL: programs of the selected institution */}
            <Modal
                open={isModalOpen && !!selectedInstitution}
                onClose={(event) => handleCloseButtonClick(event, 'main')}
                onBackdropClick={handleMainModalClose}
                zIndex="z-sw-overlay"
                size="lg"
                title={selectedInstitution?.name}
                description={selectedInstitution?.subtitle}
                headerExtra={
                    selectedInstitution && (
                        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-sw-sm bg-sw-black">
                            {ICON_MAP[selectedInstitution.icon] || <RiBuildingLine size={20} className="text-white" />}
                        </span>
                    )
                }
            >
                {selectedInstitution && (
                    <>
                        <p className="text-sw-body text-sw-text-secondary">{selectedInstitution.description}</p>
                        <h4 className="mb-4 mt-6 text-sw-h3 font-semibold">Available Programs</h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {selectedInstitution.programs.map((program, index) => (
                                <button
                                    type="button"
                                    key={index}
                                    className={programCard}
                                    onClick={(event) => {
                                        if (program.hasWebsite) {
                                            event.preventDefault()
                                            event.stopPropagation()
                                            navigate(program.websiteUrl)
                                        } else {
                                            handleProgramCardClick(event, program)
                                        }
                                    }}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold">{program.name}</span>
                                        <span className="mt-1 block text-sw-small text-sw-text-secondary">{program.type}</span>
                                        <span className="mt-1 block text-sw-caption text-sw-text-muted">{program.details}</span>
                                        <span className="mt-3 flex flex-wrap gap-2">
                                            {program.hasSubCategories && (
                                                <Badge tone="lavender">
                                                    <Icon icon={LuLayers} size="xs" />
                                                    Has Sub-Categories
                                                </Badge>
                                            )}
                                            {program.hasWebsite && (
                                                <Badge tone="blue">
                                                    <Icon icon={LuGlobe} size="xs" />
                                                    Visit Website
                                                </Badge>
                                            )}
                                        </span>
                                    </span>
                                    <Icon icon={program.hasWebsite ? LuExternalLink : LuChevronRight} size="sm" className="mt-0.5 shrink-0" />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </Modal>

            {/* SUB MODAL: courses or fee structure of the selected program */}
            <Modal
                open={isSubModalOpen && !!selectedProgram}
                onClose={(event) => handleCloseButtonClick(event, 'sub')}
                onBackdropClick={handleSubModalClose}
                zIndex="z-sw-modal"
                size="lg"
                title={selectedProgram?.name}
                description={selectedProgram?.type}
            >
                {selectedProgram && (
                    <>
                        <p className="text-sw-body text-sw-text-secondary">{selectedProgram.details}</p>
                        {selectedProgram.hasSubCategories ? (
                            // Show sub-categories (for Engineering)
                            <div>
                                <h4 className="mb-4 mt-6 text-sw-h3 font-semibold">Available Courses</h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {selectedProgram.subCategories.map((course, index) => (
                                        <button
                                            type="button"
                                            key={index}
                                            className={programCard}
                                            onClick={(event) => handleCourseCardClick(event, course)}
                                        >
                                            <span className="min-w-0 flex-1">
                                                <span className="block font-semibold">{course.name}</span>
                                                <span className="mt-1 block text-sw-small text-sw-text-secondary">{course.duration}</span>
                                                <span className="mt-1 block text-sw-caption text-sw-text-muted">{course.details}</span>
                                            </span>
                                            <Icon icon={LuChevronRight} size="sm" className="mt-0.5 shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Show fee structure (for other programs)
                            <div>
                                <h4 className="mb-4 mt-6 text-sw-h3 font-semibold">Fee Structure</h4>
                                <dl className="divide-y divide-sw-border-light rounded-sw-sm ring-1 ring-sw-border-light">
                                    {Object.entries(selectedProgram.feeStructure).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
                                            <dt className="capitalize text-sw-text-secondary">{formatFeeKey(key)}</dt>
                                            <dd className="text-sw-label font-bold">{value}</dd>
                                        </div>
                                    ))}
                                </dl>

                                {/* Additional Information */}
                                <div className="mt-6 rounded-sw-sm bg-sw-badge-blue p-4">
                                    <h5 className="mb-2 font-semibold">Important Notes:</h5>
                                    <ul className="space-y-1 text-sw-small font-normal">
                                        <li>• Fees are subject to change as per institution policy</li>
                                        <li>• Additional charges may apply for practical sessions</li>
                                        <li>• Scholarships available for meritorious students</li>
                                        <li>• Installment payment options available</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" size="sm" onClick={(event) => handleCloseButtonClick(event, 'sub')}>
                                Close
                            </Button>
                            {!selectedProgram.hasSubCategories && (
                                <Button size="sm" to="/register">
                                    Apply Now
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            {/* COURSE MODAL: third level, fee structure of one course */}
            <Modal
                open={isCourseModalOpen && !!selectedCourse}
                onClose={(event) => handleCloseButtonClick(event, 'course')}
                onBackdropClick={handleCourseModalClose}
                zIndex="z-sw-modal-top"
                size="md"
                title={selectedCourse?.name}
                description={selectedCourse?.duration}
            >
                {selectedCourse && (
                    <>
                        <p className="text-sw-body text-sw-text-secondary">{selectedCourse.details}</p>
                        <h4 className="mb-4 mt-6 text-sw-h3 font-semibold">Course Fee Structure</h4>
                        <dl className="divide-y divide-sw-border-light rounded-sw-sm ring-1 ring-sw-border-light">
                            {Object.entries(selectedCourse.feeStructure).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
                                    <dt className="capitalize text-sw-text-secondary">{formatFeeKey(key)}</dt>
                                    <dd className="text-sw-label font-bold">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        {/* Course Highlights */}
                        <div className="mt-6 rounded-sw-sm bg-sw-badge-lavender p-4">
                            <h5 className="mb-2 font-semibold">Course Highlights:</h5>
                            <ul className="space-y-1 text-sw-small font-normal">
                                <li>• Industry-aligned curriculum with latest technology</li>
                                <li>• Practical laboratory sessions and workshops</li>
                                <li>• Industry internships and project work</li>
                                <li>• Placement assistance and career guidance</li>
                                <li>• Modern infrastructure and equipment</li>
                            </ul>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" size="sm" onClick={(event) => handleCloseButtonClick(event, 'course')}>
                                Close
                            </Button>
                            <Button size="sm" to="/register">
                                Apply Now
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    )
}

export default InstitutionTypes
