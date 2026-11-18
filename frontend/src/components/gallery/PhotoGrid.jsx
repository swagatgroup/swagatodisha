import { useEffect, useState } from 'react'
import { LuChevronLeft, LuChevronRight, LuExpand, LuStar } from 'react-icons/lu'
import Modal from '../site/Modal'
import Icon from '../site/Icon'
import { cx } from '../site/cx'

// Bento sizing from the photo's own shape: starred and wide photos span two columns, tall ones two rows
const tileClass = (photo, index, featureFirst) => {
    const ratio = photo.width && photo.height ? photo.width / photo.height : 4 / 3
    if (photo.featured || (featureFirst && index === 0)) return 'col-span-2 row-span-2'
    if (ratio < 0.85) return 'row-span-2'
    if (ratio > 1.7) return 'col-span-2'
    return ''
}

// Caption pill colours cycle so the wall feels playful, not uniform
const PILL_TONES = ['bg-sw-white text-sw-black', 'bg-[rgb(var(--sw-sun))] text-sw-black', 'bg-sw-badge-blue text-sw-black', 'bg-sw-badge-lavender text-sw-black']

export const PhotoLightbox = ({ photos, index, onClose, onIndex, context }) => {
    const photo = index === null ? null : photos[index]
    const count = photos.length

    useEffect(() => {
        if (photo === null) return undefined
        const onKey = (event) => {
            if (event.key === 'ArrowRight') onIndex((index + 1) % count)
            if (event.key === 'ArrowLeft') onIndex((index - 1 + count) % count)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [photo, index, count, onIndex])

    return (
        <Modal
            open={!!photo}
            onClose={onClose}
            tone="dark"
            size="xl"
            title={photo?.title || photo?.alt}
            description={photo ? [photo.category, photo.campus || context].filter(Boolean).join(' · ') : undefined}
            bodyClassName="flex flex-col items-center gap-4"
        >
            {photo && (
                <>
                    <div className="relative w-full">
                        <img
                            key={photo.id}
                            src={photo.src}
                            alt={photo.alt}
                            width={photo.width || undefined}
                            height={photo.height || undefined}
                            className="mx-auto h-auto max-h-[68vh] w-auto max-w-full rounded-sw-sm object-contain"
                        />
                        {count > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onIndex((index - 1 + count) % count)}
                                    aria-label="Previous photo"
                                    className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sw-pill bg-sw-black/60 text-sw-white ring-1 ring-sw-white/20 backdrop-blur hover:bg-sw-black/80"
                                >
                                    <Icon icon={LuChevronLeft} size="sm" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onIndex((index + 1) % count)}
                                    aria-label="Next photo"
                                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sw-pill bg-sw-black/60 text-sw-white ring-1 ring-sw-white/20 backdrop-blur hover:bg-sw-black/80"
                                >
                                    <Icon icon={LuChevronRight} size="sm" />
                                </button>
                            </>
                        )}
                    </div>
                    {photo.description && <p className="max-w-2xl text-center text-sw-body text-sw-text-on-dark-secondary">{photo.description}</p>}
                    {count > 1 && <p className="text-sw-small text-sw-text-on-dark-muted" aria-live="polite">{index + 1} of {count}</p>}
                </>
            )}
        </Modal>
    )
}

// Bento photo wall + its own lightbox. `context` names the place for alt text when a photo has no campus.
const PhotoGrid = ({ photos, context = 'Swagat Group of Institutions, Odisha', featureFirst = false, className }) => {
    const [open, setOpen] = useState(null)

    return (
        <>
            <ul className={cx('grid grid-flow-dense grid-cols-2 gap-3 auto-rows-[150px] sm:auto-rows-[190px] md:grid-cols-3 lg:grid-cols-4 lg:auto-rows-[210px]', className)}>
                {photos.map((photo, index) => (
                    <li key={photo.id} className={tileClass(photo, index, featureFirst)}>
                        <button
                            type="button"
                            onClick={() => setOpen(index)}
                            className="group relative block h-full w-full overflow-hidden rounded-[22px] bg-sw-badge-blue text-left focus-visible:ring-4 focus-visible:ring-[rgb(var(--sw-sun))]"
                            aria-label={`Open photo: ${photo.title || photo.alt}`}
                        >
                            <img
                                src={photo.thumb}
                                alt={`${photo.alt}, ${photo.campus || context}`}
                                loading="lazy"
                                decoding="async"
                                width={photo.width || undefined}
                                height={photo.height || undefined}
                                className="h-full w-full object-cover transition-transform duration-[900ms] ease-sw motion-safe:group-hover:scale-[1.05]"
                            />
                            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-sw-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-sw group-hover:opacity-100" />
                            {photo.featured && (
                                <span aria-hidden="true" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-sw-pill bg-[rgb(var(--sw-sun))] text-sw-black shadow-sw-soft">
                                    <Icon icon={LuStar} size="xs" />
                                </span>
                            )}
                            <span aria-hidden="true" className="absolute right-3 bottom-3 flex h-9 w-9 scale-75 items-center justify-center rounded-sw-pill bg-sw-white text-sw-black opacity-0 transition-all duration-sw group-hover:scale-100 group-hover:opacity-100">
                                <Icon icon={LuExpand} size="xs" />
                            </span>
                            {photo.title && (
                                <span className={cx('absolute bottom-3 left-3 max-w-[calc(100%-4.5rem)] truncate rounded-sw-pill px-3 py-1.5 text-[13px] font-semibold leading-tight shadow-sw-soft', PILL_TONES[index % PILL_TONES.length])}>
                                    {photo.title}
                                </span>
                            )}
                        </button>
                    </li>
                ))}
            </ul>
            <PhotoLightbox photos={photos} index={open} onClose={() => setOpen(null)} onIndex={setOpen} context={context} />
        </>
    )
}

export default PhotoGrid
