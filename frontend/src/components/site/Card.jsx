import { cx } from './cx'

const VARIANTS = {
    // Black slab (Explore tiles, institution and campus cards)
    dark: 'bg-sw-black text-sw-text-on-dark rounded-sw-md',
    // White card with hairline + offset shadow ("Why choose" cards)
    outline: 'bg-sw-white text-sw-text rounded-sw-sm ring-1 ring-sw-border-light shadow-sw-offset',
    // Light grey panel (contact form)
    panel: 'bg-sw-surface-muted text-sw-text rounded-sw-sm',
    // Plain white with soft shadow
    soft: 'bg-sw-white text-sw-text rounded-sw-md shadow-sw-soft ring-1 ring-sw-border-light',
}

const Card = ({ as = 'div', variant = 'dark', interactive = false, className, children, ...rest }) => {
    const Tag = as
    return (
        <Tag
            className={cx(
                'relative',
                VARIANTS[variant],
                interactive && 'transition-transform duration-sw ease-sw motion-safe:hover:-translate-y-1',
                className
            )}
            {...rest}
        >
            {children}
        </Tag>
    )
}

export default Card
