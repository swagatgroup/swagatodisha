import { useSyncExternalStore } from 'react'
import { isBookLoaderVisible, subscribeBookLoader } from '../../utils/bookLoader'
import { cx } from './cx'

export const BOOK_LOADER_GIF = '/images/brand/swagat-book-loader.gif'

// The Swagat book turning its pages, on a navy card so it reads on any background
const Book = ({ size = 132 }) => (
    <span className="inline-flex rounded-sw-md bg-sw-black p-2 shadow-sw-overlay ring-1 ring-sw-white/10">
        <img src={BOOK_LOADER_GIF} alt="" width={size} height={Math.round(size * 0.6875)} decoding="async" />
    </span>
)

// variant "overlay": blurs whatever is on screen; "page": fills an empty screen (route / auth loading)
const BookLoader = ({ variant = 'page', label = 'Loading', className }) => (
    <div
        role="status"
        aria-live="polite"
        className={cx(
            'flex items-center justify-center',
            variant === 'overlay'
                ? 'fixed inset-0 z-[10050] bg-sw-black/25 backdrop-blur-sm motion-safe:animate-[sw-fade-in_200ms_ease-out]'
                : 'min-h-screen bg-sw-surface-muted dark:bg-[#0A1430]',
            className
        )}
    >
        <Book />
        <span className="sr-only">{label}…</span>
    </div>
)

// Mounted once in App: shows the overlay while a slow request or showLoading() is in progress
export const GlobalBookLoader = () => {
    const visible = useSyncExternalStore(subscribeBookLoader, isBookLoaderVisible, () => false)
    return visible ? <BookLoader variant="overlay" /> : null
}

export default BookLoader
