import {useEffect, useRef, useState} from 'react';
import api from '../utils/api'
import {
    LuArrowDown,
    LuArrowUpRight,
    LuBellRing,
    LuCalendarDays,
    LuDownload,
    LuFileMinus,
    LuFileText,
    LuImage,
    LuInbox,
    LuLink,
    LuMegaphone,
} from 'react-icons/lu'
import { SectionHeader } from './site/Layout'
import Button from './site/Button'
import Icon from './site/Icon'
import Modal from './site/Modal'
import { EmptyState, LoadingList } from './site/Feedback'
import { cx } from './site/cx'

// Anything uploaded in the last 60 days counts as recent
const RECENT_DAYS = 60
const isRecent = (date) => {
    if (!date) return false
    const age = Date.now() - new Date(date).getTime()
    return age >= 0 && age <= RECENT_DAYS * 24 * 60 * 60 * 1000
}

const QuickLinks = () => {
    const [activeOverlay, setActiveOverlay] = useState(null)
    const [blinkingLinks, setBlinkingLinks] = useState(new Set())
    const [pdfViewer, setPdfViewer] = useState({ isOpen: false, file: null, name: null })
    const [isUserScrolling, setIsUserScrolling] = useState(false)
    const scrollContainerRef = useRef(null)
    const [documents, setDocuments] = useState([])
    const [loadingDocuments, setLoadingDocuments] = useState(true)

    // Fetch real documents from API
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoadingDocuments(true)
                const response = await api.get('/api/admin/quick-access/public')
                if (response.data.success) {
                    setDocuments(response.data.data || [])
                }
            } catch (error) {
                console.error('Error fetching documents:', error)
                // If API fails, use empty array (no dummy data)
                setDocuments([])
            } finally {
                setLoadingDocuments(false)
            }
        }
        fetchDocuments()
    }, [])

    // Organize documents by type
    const documentSections = {
        timetable: {
            title: "Time Tables & Schedules",
            description: "Academic schedules from different universities",
            documents: documents
                .filter(doc => doc.type === 'timetable' && doc.isActive)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(doc => {
                    // Determine file type - check for PDF in URL or file extension
                    const isPDF = doc.file?.includes('.pdf') || 
                                  doc.file?.includes('/raw/') || 
                                  doc.fileName?.toLowerCase().endsWith('.pdf') ||
                                  doc.file?.match(/\.pdf(\?|$)/i);
                    const isImage = doc.file?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
                    return {
                        name: doc.title,
                        file: doc.file,
                        type: isPDF ? 'pdf' : (isImage ? 'image' : 'pdf'), // Default to PDF if uncertain
                        description: doc.description || doc.title,
                        isRecent: isRecent(doc.publishDate || doc.createdAt)
                    };
                })
        },
        notifications: {
            title: "Exam Notifications",
            description: "Exam dates, forms and notices from the universities",
            documents: documents
                .filter(doc => doc.type === 'notification' && doc.isActive)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(doc => {
                    // Determine file type - check for PDF in URL or file extension
                    const isPDF = doc.file?.includes('.pdf') || 
                                  doc.file?.includes('/raw/') || 
                                  doc.fileName?.toLowerCase().endsWith('.pdf') ||
                                  doc.file?.match(/\.pdf(\?|$)/i);
                    const isImage = doc.file?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
                    return {
                        name: doc.title,
                        file: doc.file,
                        type: isPDF ? 'pdf' : (isImage ? 'image' : 'pdf'), // Default to PDF if uncertain
                        description: doc.description || doc.title,
                        isRecent: isRecent(doc.publishDate || doc.createdAt)
                    };
                })
        },
        updates: {
            title: "Latest Updates",
            description: "News and announcements from Swagat",
            documents: documents
                .filter(doc => doc.type === 'update' && doc.isActive)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(doc => {
                    // Determine file type - check for PDF in URL or file extension
                    const isPDF = doc.file?.includes('.pdf') || 
                                  doc.file?.includes('/raw/') || 
                                  doc.fileName?.toLowerCase().endsWith('.pdf') ||
                                  doc.file?.match(/\.pdf(\?|$)/i);
                    const isImage = doc.file?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
                    return {
                        name: doc.title,
                        file: doc.file,
                        type: isPDF ? 'pdf' : (isImage ? 'image' : 'pdf'), // Default to PDF if uncertain
                        description: doc.description || doc.title,
                        isRecent: isRecent(doc.publishDate || doc.createdAt)
                    };
                })
        },
        results: {
            title: "Results & Admissions",
            description: "Academic results and admission information",
            documents: documents
                .filter(doc => doc.type === 'result' && doc.isActive)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(doc => {
                    // Determine file type - check for PDF in URL or file extension
                    const isPDF = doc.file?.includes('.pdf') || 
                                  doc.file?.includes('/raw/') || 
                                  doc.fileName?.toLowerCase().endsWith('.pdf') ||
                                  doc.file?.match(/\.pdf(\?|$)/i);
                    const isImage = doc.file?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
                    return {
                        name: doc.title,
                        file: doc.file,
                        type: isPDF ? 'pdf' : (isImage ? 'image' : 'pdf'), // Default to PDF if uncertain
                        description: doc.description || doc.title,
                        isRecent: isRecent(doc.publishDate || doc.createdAt)
                    };
                })
        }
    }

    // Blinking animation for links
    const startBlinking = (documentName) => {
        setBlinkingLinks(prev => new Set([...prev, documentName]))
        setTimeout(() => {
            setBlinkingLinks(prev => {
                const newSet = new Set(prev)
                newSet.delete(documentName)
                return newSet
            })
        }, 3000) // Blink for 3 seconds
    }

    const handleDocumentClick = (documentName, fileUrl) => {
        // Document clicked
        startBlinking(documentName)

        // Open file in new tab
        window.open(fileUrl, '_blank', 'noopener,noreferrer')
    }

    const handleDocumentHover = (documentName) => {
        startBlinking(documentName)
    }

    // Career modal hover handlers with delay
    

    // Handle mouse enter/leave for scroll control
    const handleMouseEnter = () => {
        setIsUserScrolling(true)
    }

    const handleMouseLeave = () => {
        setIsUserScrolling(false)
    }

    // Handle wheel scroll
    const handleWheelScroll = (e) => {
        if (scrollContainerRef.current) {
            e.preventDefault()
            const container = scrollContainerRef.current
            const scrollAmount = e.deltaY * 0.5 // Adjust scroll sensitivity
            container.scrollTop += scrollAmount
        }
    }

    // Explore tiles. Mobile order follows the Figma mobile frame; `overlayAlign`
    // keeps each document panel inside the viewport for its grid column.
    const quickLinks = [
        {
            id: 1,
            title: "Time Tables",
            description: "View schedules from different universities",
            icon: LuCalendarDays,
            pane: "sw-pane-timetable",
            order: "order-3 min-[900px]:order-none",
            overlayAlign: "left-0",
            category: "timetable"
        },
        {
            id: 2,
            title: "Latest Updates",
            description: "News and announcements from Swagat",
            icon: LuMegaphone,
            pane: "sw-pane-career",
            order: "order-4 min-[900px]:order-none",
            overlayAlign: "right-0",
            category: "updates"
        },
        {
            id: 3,
            title: "Exam Notifications",
            description: "Exam dates, forms and notices",
            icon: LuBellRing,
            pane: "sw-pane-notice",
            order: "order-1 min-[900px]:order-none",
            overlayAlign: "left-0",
            category: "notifications"
        },
        {
            id: 4,
            title: "Results",
            description: "Check academic performance",
            icon: LuFileMinus,
            pane: "sw-pane-result",
            order: "order-2 min-[900px]:order-none",
            overlayAlign: "right-0",
            category: "results"
        }
    ]

    // Touch and keyboard: close an open document panel with Esc or a tap outside
    const tilesRef = useRef(null)
    useEffect(() => {
        if (!activeOverlay) return undefined
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setActiveOverlay(null)
        }
        const onPointerDown = (event) => {
            if (tilesRef.current && !tilesRef.current.contains(event.target)) setActiveOverlay(null)
        }
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('pointerdown', onPointerDown)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.removeEventListener('pointerdown', onPointerDown)
        }
    }, [activeOverlay])

    const renderDocument = (doc, docIndex, keySuffix = '') => (
        <div key={`${doc.name}${keySuffix}`} className="group">
            <button
                type="button"
                onClick={() => handleDocumentClick(doc.name, doc.file)}
                onMouseEnter={() => handleDocumentHover(doc.name)}
                disabled={loadingDocuments}
                className={cx(
                    'flex w-full items-center gap-3 rounded-sw-sm p-2 text-left transition-colors duration-sw-fast',
                    blinkingLinks.has(doc.name)
                        ? 'bg-sw-white text-sw-black'
                        : 'bg-sw-white/5 text-sw-white hover:bg-sw-white/10',
                    loadingDocuments && 'cursor-not-allowed opacity-50'
                )}
            >
                <span className={cx(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-sw-sm',
                    blinkingLinks.has(doc.name) ? 'bg-sw-black text-sw-white' : 'bg-sw-white/10'
                )}>
                    <Icon icon={doc.type === 'pdf' ? LuFileText : LuImage} size="xs" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className={cx('block text-sw-small font-semibold', blinkingLinks.has(doc.name) && 'motion-safe:animate-pulse')}>
                        {blinkingLinks.has(doc.name) && <Icon icon={LuLink} size={14} className="mr-1 inline-block align-[-2px]" />}{doc.name}
                        {doc.isRecent && <span className="ml-2 inline-block rounded-sw-pill bg-[rgb(var(--sw-accent-garnet))] px-1.5 align-[1px] text-[10px] font-bold text-sw-white">New</span>}
                    </span>
                    <span className={cx('mt-0.5 block truncate text-sw-caption', blinkingLinks.has(doc.name) ? 'text-sw-text-secondary' : 'text-sw-text-on-dark-muted')}>
                        {doc.description}
                    </span>
                </span>
                <Icon
                    icon={LuArrowDown}
                    size="xs"
                    className={cx('shrink-0', blinkingLinks.has(doc.name) ? 'motion-safe:animate-bounce' : 'text-sw-text-on-dark-muted group-hover:text-sw-white')}
                />
            </button>
        </div>
    )

    return (
        <div className="flex h-full flex-col">
                <SectionHeader title="Explore Swagat" subtitle="Everything you need, one click away." className="min-[900px]:!mb-5" subtitleClassName="min-[900px]:!text-sw-body" />

                {/* Tiles */}
                <ul ref={tilesRef} className="mx-auto grid w-full max-w-sm flex-1 grid-cols-2 gap-x-6 gap-y-8 sm:max-w-md sm:gap-x-10 min-[900px]:max-w-none min-[900px]:gap-3 lg:gap-4">
                    {quickLinks.map((link) => {
                        const recentCount = documentSections[link.category]?.documents.filter((doc) => doc.isRecent).length || 0
                        return (
                        <li key={link.id} className={cx('relative', link.order)}>
                            <div
                                className="group relative h-full"
                                onMouseEnter={() => {
                                    setActiveOverlay(link.category)
                                }}
                                onMouseLeave={() => setActiveOverlay(null)}
                            >
                                {/* Card */}
                                <button
                                    type="button"
                                    onClick={() => setActiveOverlay(link.category)}
                                    aria-expanded={activeOverlay === link.category}
                                    aria-label={recentCount > 0 ? `${link.title}: ${recentCount} new in the last ${RECENT_DAYS} days` : undefined}
                                    className="sw-deco-card flex h-full w-full flex-col rounded-sw-md bg-sw-black p-3 text-left text-sw-white ring-2 ring-inset ring-sw-border-dark transition-transform duration-sw ease-sw motion-safe:group-hover:-translate-y-1 lg:p-4"
                                >
                                    <span className={cx('sw-pane relative flex aspect-square w-full items-center justify-center rounded-sw-sm min-[900px]:aspect-[2/1] min-[900px]:flex-1', link.pane)}>
                                        <Icon icon={link.icon} size={72} strokeWidth={1.25} className="text-sw-white/90" />
                                        {recentCount > 0 && (
                                            <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-sw-pill bg-[rgb(var(--sw-accent-garnet))] px-2 py-1 text-sw-caption font-bold leading-none text-sw-white shadow-sw-soft">
                                                <Icon icon={LuBellRing} size={14} className="sw-bell-shake" />
                                                {recentCount}
                                            </span>
                                        )}
                                    </span>
                                    <span className="mt-3 flex items-end justify-between gap-2">
                                        <span className="sw-text-gradient min-w-0 font-sw-display text-sw-tile min-[900px]:text-sw-label xl:text-sw-h3">{link.title}</span>
                                        <Icon
                                            icon={LuArrowUpRight}
                                            size="md"
                                            strokeWidth={2.75}
                                            className="mb-1 shrink-0 text-sw-gray-300 min-[900px]:max-xl:hidden transition-transform duration-sw-fast motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                                        />
                                    </span>
                                    <span className="mt-1 text-sw-caption text-sw-text-on-dark-muted">{link.description}</span>
                                </button>

                                {/* Document panel: appears over the card on hover (or tap / Enter) */}
                                {activeOverlay === link.category && documentSections[link.category] && (
                                    <div
                                        className={cx(
                                            'absolute top-0 z-30 flex w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-sw-md bg-sw-black text-sw-white shadow-sw-overlay ring-1 ring-sw-white/15',
                                            link.overlayAlign
                                        )}
                                        style={{ height: '400px' }}
                                    >
                                        {/* Overlay Header */}
                                        <div className="border-b border-sw-white/10 p-4">
                                            <h3 className="text-sw-label font-bold">
                                                {documentSections[link.category].title}
                                            </h3>
                                            <p className="mt-1 text-sw-caption text-sw-text-on-dark-secondary">
                                                {documentSections[link.category].description}
                                            </p>
                                        </div>

                                        {/* Auto-scrolling Content - Negative Y scroll in loop */}
                                        <div
                                            ref={scrollContainerRef}
                                            className="scrollbar-hide relative min-h-0 flex-1 overflow-y-auto p-3"
                                            style={{
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none'
                                            }}
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                            onWheel={handleWheelScroll}
                                        >
                                            {/* Auto-scrolling container */}
                                            <div
                                                className={`space-y-2 ${!isUserScrolling ? 'motion-safe:animate-scroll-up' : ''}`}
                                                style={{
                                                    animationDuration: '15s',
                                                    animationPlayState: isUserScrolling ? 'paused' : 'running'
                                                }}
                                            >
                                                {loadingDocuments ? (
                                                    <LoadingList rows={4} tone="dark" label="Loading documents..." />
                                                ) : documentSections[link.category].documents.length === 0 ? (
                                                    <EmptyState icon={LuInbox} tone="dark" title="No documents available" />
                                                ) : (
                                                    <>
                                                        {/* First set of documents */}
                                                        {documentSections[link.category].documents.map((doc, docIndex) => renderDocument(doc, docIndex))}

                                                        {/* Duplicate set for seamless loop - only show if there are multiple items */}
                                                        {documentSections[link.category].documents.length > 1 && documentSections[link.category].documents.map((doc, docIndex) => renderDocument(doc, docIndex, '-duplicate'))}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </li>
                        )
                    })}
                </ul>

            {/* PDF Viewer Modal */}
            <Modal
                open={pdfViewer.isOpen}
                onClose={() => setPdfViewer({ isOpen: false, file: null, name: null })}
                title={pdfViewer.name}
                description="Document Viewer"
                size="xl"
                bodyClassName="p-0 sm:p-0"
            >
                <div className="flex justify-end border-b border-sw-border-light px-5 py-3">
                    {/* Download Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        iconLeft={LuDownload}
                        onClick={() => {
                            const fileUrl = pdfViewer.file
                            const link = document.createElement('a')
                            link.href = fileUrl
                            link.download = pdfViewer.name || 'document'
                            link.target = '_blank'
                            link.style.display = 'none'
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                        }}
                    >
                        Download
                    </Button>
                </div>

                {/* PDF Content */}
                <div className="h-[70vh] overflow-hidden">
                    {pdfViewer.file?.endsWith('.pdf') || pdfViewer.file?.includes('.pdf') || pdfViewer.file?.match(/\.pdf(\?|$)/i) ? (
                        <iframe
                            src={`${pdfViewer.file}#toolbar=1&navpanes=1&scrollbar=1`}
                            className="h-full w-full border-0"
                            title={pdfViewer.name}
                            onError={(e) => {
                                console.error('PDF loading error:', e)
                            }}
                            onLoad={() => {
                                // PDF loaded successfully
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <img
                                src={pdfViewer.file}
                                alt={pdfViewer.name}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                    console.error('Image loading error:', e)
                                }}
                                onLoad={() => {
                                    // Image loaded successfully
                                }}
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}

export default QuickLinks
