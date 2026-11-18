import { useEffect, useMemo, useState } from 'react'
import { LuCamera, LuHeart, LuImage, LuMapPin, LuPhone, LuRefreshCw, LuSparkles, LuStar } from 'react-icons/lu'
import api from '../utils/api'
import { CONTACT_INFO } from '../utils/constants'
import { PHONE_DISPLAY } from '../seo/routes'
import { GALLERY_CATEGORIES, toGalleryPhoto } from '../data/gallery'
import { Container, Section } from './site/Layout'
import Badge from './site/Badge'
import Button from './site/Button'
import Icon from './site/Icon'
import { EmptyState, Skeleton } from './site/Feedback'
import { cx } from './site/cx'
import PhotoGrid from './gallery/PhotoGrid'

const PAGE_SIZE = 24
const CATEGORY_ORDER = GALLERY_CATEGORIES.map((c) => c.value)

// Tilted "polaroid" cards in the hero: the newest starred photos, or soft colour cards until photos exist
const POLAROID_POSES = [
    'left-[4%] top-[14%] -rotate-[7deg] z-10',
    'right-[2%] top-0 rotate-[5deg] z-20',
    'left-[26%] bottom-0 -rotate-[2deg] z-30',
]
const PLACEHOLDER_CARDS = [
    { icon: LuCamera, label: 'Campus life', tone: 'bg-sw-badge-blue' },
    { icon: LuStar, label: 'Celebrations', tone: 'bg-[rgb(var(--sw-sun))]' },
    { icon: LuHeart, label: 'Friendships', tone: 'bg-sw-badge-lavender' },
]

const HeroCollage = ({ photos }) => (
    <div aria-hidden="true" className="relative mx-auto hidden h-[360px] w-full max-w-[460px] lg:block">
        {POLAROID_POSES.map((pose, i) => {
            const photo = photos[i]
            const card = PLACEHOLDER_CARDS[i]
            return (
                <div key={pose} className={cx('absolute w-[58%] rounded-[18px] bg-sw-white p-2.5 pb-9 shadow-sw-overlay', pose)}>
                    {photo ? (
                        <img src={photo.thumb} alt="" className="aspect-[4/3] w-full rounded-[12px] object-cover" />
                    ) : (
                        <div className={cx('flex aspect-[4/3] w-full items-center justify-center rounded-[12px] text-sw-black', card.tone)}>
                            <Icon icon={card.icon} size="lg" />
                        </div>
                    )}
                    <p className="absolute bottom-2.5 left-0 right-0 truncate px-3 text-center text-[13px] font-semibold text-sw-black">
                        {photo?.title || card.label}
                    </p>
                </div>
            )
        })}
        <span className="sw-bob absolute -right-2 bottom-10 z-40 flex h-16 w-16 items-center justify-center rounded-sw-pill bg-[rgb(var(--sw-sun))] text-sw-black shadow-sw-soft [--sw-tilt:12deg]">
            <Icon icon={LuSparkles} size="md" />
        </span>
    </div>
)

const Gallery = () => {
    const [photos, setPhotos] = useState([])
    const [status, setStatus] = useState('loading') // loading | ready | error
    const [category, setCategory] = useState('all')
    const [campus, setCampus] = useState('all')
    const [shown, setShown] = useState(PAGE_SIZE)

    const load = async () => {
        setStatus('loading')
        try {
            const res = await api.get('/api/gallery/public', { params: { limit: 200 } })
            if (!res.data?.success) throw new Error('Bad response')
            setPhotos((res.data.data || []).map(toGalleryPhoto))
            setStatus('ready')
        } catch (err) {
            console.error('Error fetching gallery:', err)
            setStatus('error')
        }
    }

    useEffect(() => { load() }, [])

    // Only offer filters that have photos behind them
    const categoryCounts = useMemo(() => {
        const counts = {}
        photos.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1 })
        return Object.entries(counts).sort((a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]))
    }, [photos])

    const campuses = useMemo(() => [...new Set(photos.map((p) => p.campus).filter(Boolean))].sort(), [photos])

    const filtered = useMemo(() => photos.filter((p) =>
        (category === 'all' || p.category === category) &&
        (campus === 'all' || p.campus === campus)
    ), [photos, category, campus])

    useEffect(() => { setShown(PAGE_SIZE) }, [category, campus])

    const heroPhotos = useMemo(() => [...photos.filter((p) => p.featured), ...photos.filter((p) => !p.featured)].slice(0, 3), [photos])

    const chip = (active) => cx(
        'inline-flex min-h-11 items-center gap-2 rounded-sw-pill px-4 text-sw-small font-semibold transition-colors duration-sw-fast',
        active ? 'bg-sw-black text-sw-white' : 'bg-sw-white text-sw-black ring-1 ring-inset ring-sw-border-light hover:ring-sw-black'
    )

    return (
        <div>
            {/* Attention */}
            <section className="sw-deco-navy relative overflow-hidden bg-sw-black text-sw-text-on-dark">
                <div className="sw-container grid items-center gap-10 pb-16 pt-[calc(var(--sw-header-h)+2.5rem)] lg:grid-cols-[1.15fr_1fr] lg:pb-20 lg:pt-[calc(var(--sw-header-h)+4rem)]">
                    <div className="text-center lg:text-left">
                        <Badge tone="dark" className="mb-5">
                            <Icon icon={LuCamera} size="xs" />
                            Photo gallery · Swagat Group of Institutions
                        </Badge>
                        <h1 className="text-sw-display font-bold">
                            See life at Swagat, <span className="sw-marker text-sw-black">up close.</span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-sw-subtitle text-sw-text-on-dark-secondary lg:mx-0">
                            Classrooms, celebrations, sports days and everyday moments from our schools and campuses across western Odisha.
                        </p>
                        {status === 'ready' && photos.length > 0 && (
                            <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label="Gallery at a glance">
                                <li><Badge tone="blue"><Icon icon={LuImage} size="xs" />{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</Badge></li>
                                {campuses.length > 0 && (
                                    <li><Badge tone="peach"><Icon icon={LuMapPin} size="xs" />{campuses.length} {campuses.length === 1 ? 'campus or school' : 'campuses and schools'}</Badge></li>
                                )}
                            </ul>
                        )}
                    </div>
                    <HeroCollage photos={heroPhotos} />
                </div>
            </section>

            {/* Interest: the photo wall */}
            <Section id="gallery-grid" className="sw-deco-light py-10 lg:py-14">
                <Container>
                    {status === 'loading' && (
                        <div role="status" aria-live="polite" className="grid grid-cols-2 gap-3 auto-rows-[150px] sm:auto-rows-[190px] md:grid-cols-3 lg:grid-cols-4 lg:auto-rows-[210px]">
                            <span className="sr-only">Loading photos</span>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className={cx('h-full rounded-[22px]', i === 0 && 'col-span-2 row-span-2')} />
                            ))}
                        </div>
                    )}

                    {status === 'error' && (
                        <EmptyState
                            icon={LuImage}
                            title="We couldn't load the photos just now"
                            description="Please check your connection and try again."
                            action={<Button variant="primary" iconLeft={LuRefreshCw} onClick={load}>Try again</Button>}
                        />
                    )}

                    {status === 'ready' && photos.length === 0 && (
                        <EmptyState
                            icon={LuCamera}
                            title="Fresh photos are on their way"
                            description="We are adding pictures from our schools and campuses. Until then, come and visit; we would love to show you around."
                            action={<Button variant="primary" to="/contact">Plan a visit</Button>}
                        />
                    )}

                    {status === 'ready' && photos.length > 0 && (
                        <>
                            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div role="group" aria-label="Filter photos by category" className="flex flex-wrap gap-2">
                                    <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')} className={chip(category === 'all')}>
                                        All photos <span className="opacity-60">{photos.length}</span>
                                    </button>
                                    {categoryCounts.map(([name, count]) => (
                                        <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)} className={chip(category === name)}>
                                            {name} <span className="opacity-60">{count}</span>
                                        </button>
                                    ))}
                                </div>
                                {campuses.length > 1 && (
                                    <label className="flex min-w-0 items-center gap-2 text-sw-small font-semibold">
                                        <Icon icon={LuMapPin} size="xs" />
                                        <span className="shrink-0">Campus</span>
                                        <select
                                            value={campus}
                                            onChange={(e) => setCampus(e.target.value)}
                                            className="min-h-11 min-w-0 max-w-full flex-1 rounded-sw-pill border-0 bg-sw-white px-4 text-sw-small ring-1 ring-inset ring-sw-border-light focus:ring-sw-black"
                                        >
                                            <option value="all">All campuses</option>
                                            {campuses.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </label>
                                )}
                            </div>

                            {filtered.length === 0 ? (
                                <EmptyState
                                    icon={LuImage}
                                    title="No photos here yet"
                                    description="Try another category or campus."
                                    action={<Button variant="outline" onClick={() => { setCategory('all'); setCampus('all') }}>Show all photos</Button>}
                                />
                            ) : (
                                <>
                                    <PhotoGrid photos={filtered.slice(0, shown)} />
                                    {filtered.length > shown && (
                                        <div className="mt-8 flex justify-center">
                                            <Button variant="outline" size="lg" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                                                Show more photos ({filtered.length - shown} left)
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </Container>
            </Section>

            {/* Desire + Action */}
            <Section tone="dark">
                <Container className="text-center">
                    <h2 className="text-sw-display font-bold">
                        Like what you see? <span className="sw-marker text-sw-black">Come and visit.</span>
                    </h2>
                    <p className="mx-auto mb-8 mt-4 max-w-3xl text-sw-subtitle text-sw-text-on-dark-secondary">
                        Visit any of our seven campuses in western Odisha. Meet the team, see the classrooms, and ask about admission, fees and the support you get until you complete.
                    </p>
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Button variant="inverse" size="lg" to="/contact" iconRight={LuMapPin}>Plan a campus visit</Button>
                        <Button variant="glass" size="lg" href={`tel:${CONTACT_INFO.phone}`} iconRight={LuPhone}>Call {PHONE_DISPLAY}</Button>
                    </div>
                </Container>
            </Section>
        </div>
    )
}

export default Gallery
