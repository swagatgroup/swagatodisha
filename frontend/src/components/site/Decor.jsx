import { cx } from './cx'

// Clusters of light-grey dots behind the campus cards (Figma "dotted map")
export const DotField = ({ className }) => (
    <div aria-hidden="true" className={cx('sw-dot-field pointer-events-none absolute', className)} />
)

// Outline "pointer hand" doodle used beside the "Why choose" heading
export const PointerDoodle = ({ className }) => (
    <svg
        aria-hidden="true"
        viewBox="0 0 48 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cx('pointer-events-none', className)}
    >
        <path d="M17 26V8a4 4 0 0 1 8 0v14" />
        <path d="M25 20v-2a4 4 0 0 1 8 0v4" />
        <path d="M33 22a4 4 0 0 1 8 0v8c0 9-6 16-15 16h-2c-6 0-9-3-12-7l-6-9a4 4 0 0 1 6-5l4 4" />
        <path d="M23 34v6M28 34v6M33 34v6" />
    </svg>
)
