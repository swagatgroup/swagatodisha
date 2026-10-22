import { cx } from './cx'

const TONES = {
    blue: 'bg-sw-badge-blue text-sw-black',
    lavender: 'bg-sw-badge-lavender text-sw-black',
    peach: 'bg-sw-badge-peach text-sw-black',
    neutral: 'bg-sw-gray-100 text-sw-black',
    dark: 'bg-sw-white/10 text-sw-white ring-1 ring-inset ring-sw-white/20',
    success: 'bg-sw-success-bg text-sw-success',
    warning: 'bg-sw-warning-bg text-sw-warning',
    error: 'bg-sw-error-bg text-sw-error',
    info: 'bg-sw-info-bg text-sw-info',
}

const Badge = ({ as = 'span', tone = 'blue', className, children, ...rest }) => {
    const Tag = as
    return (
        <Tag
            className={cx(
                'inline-flex items-center gap-1.5 rounded-sw-pill px-2 py-1 text-sw-small font-semibold',
                TONES[tone],
                className
            )}
            {...rest}
        >
            {children}
        </Tag>
    )
}

export default Badge
