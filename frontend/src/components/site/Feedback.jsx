import Icon from './Icon'
import { cx } from './cx'

// Shimmer block for loading states
export const Skeleton = ({ className, tone = 'light' }) => (
    <div
        aria-hidden="true"
        className={cx(
            'motion-safe:animate-pulse rounded-sw-sm',
            tone === 'dark' ? 'bg-sw-white/10' : 'bg-sw-gray-100',
            className
        )}
    />
)

// Announces loading to assistive tech while showing skeleton rows
export const LoadingList = ({ rows = 3, label = 'Loading', tone = 'light', className }) => (
    <div role="status" aria-live="polite" className={cx('space-y-2', className)}>
        <span className="sr-only">{label}</span>
        {Array.from({ length: rows }, (_, i) => (
            <Skeleton key={i} tone={tone} className="h-14 w-full" />
        ))}
    </div>
)

export const EmptyState = ({ icon, title, description, action, tone = 'light', className }) => (
    <div className={cx('flex flex-col items-center justify-center gap-3 px-4 py-10 text-center', className)}>
        {icon && (
            <span
                className={cx(
                    'flex h-12 w-12 items-center justify-center rounded-sw-pill',
                    tone === 'dark' ? 'bg-sw-white/10 text-sw-white' : 'bg-sw-gray-100 text-sw-black'
                )}
            >
                <Icon icon={icon} size="md" strokeWidth={1.5} />
            </span>
        )}
        {title && <p className="text-sw-label font-semibold">{title}</p>}
        {description && (
            <p className={cx('max-w-sm text-sw-body', tone === 'dark' ? 'text-sw-text-on-dark-secondary' : 'text-sw-text-muted')}>
                {description}
            </p>
        )}
        {action}
    </div>
)
