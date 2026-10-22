import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { LuLoaderCircle } from 'react-icons/lu'
import Icon from './Icon'
import { cx } from './cx'

const VARIANTS = {
    // Solid black (form submit, primary actions on light surfaces)
    primary: 'bg-sw-black text-sw-white hover:bg-sw-gray-800 disabled:bg-sw-gray-500',
    // White pill with soft shadow ("See all resources")
    light: 'bg-sw-surface-pill text-sw-black shadow-sw-soft hover:bg-sw-white hover:shadow-sw-input disabled:text-sw-text-muted',
    // Dark glass pill (nav, Login, Get Direction)
    glass: 'bg-sw-glass/90 text-sw-white shadow-sw-glass backdrop-blur-sw-glass ring-1 ring-inset ring-sw-white/10 hover:bg-sw-glass-hover disabled:text-sw-text-on-dark-muted',
    // Frosted pill over photography (hero CTA)
    frost: 'bg-sw-white/20 text-sw-white backdrop-blur-md ring-1 ring-inset ring-sw-white/45 hover:bg-sw-white/30',
    // White solid on dark surfaces
    inverse: 'bg-sw-white text-sw-black hover:bg-sw-gray-100',
    // Outline on light surfaces
    outline: 'bg-transparent text-sw-black ring-1 ring-inset ring-sw-black hover:bg-sw-black hover:text-sw-white',
    // Text-only
    ghost: 'bg-transparent text-current hover:bg-sw-black/5',
}

// min-h keeps every size at a 44px tap target
const SIZES = {
    sm: 'min-h-11 px-4 text-sw-small gap-2',
    md: 'min-h-11 px-5 text-sw-label gap-2.5',
    lg: 'min-h-12 lg:min-h-14 px-6 text-sw-label gap-3',
}

const Button = forwardRef(function Button(
    {
        variant = 'primary',
        size = 'md',
        shape = 'pill',
        to,
        href,
        iconLeft,
        iconRight,
        loading = false,
        fullWidth = false,
        disabled,
        className,
        children,
        type,
        ...rest
    },
    ref
) {
    const classes = cx(
        'inline-flex items-center justify-center font-semibold leading-none whitespace-nowrap select-none',
        'transition-[background-color,box-shadow,color,transform] duration-sw-fast ease-sw',
        'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:opacity-60',
        shape === 'pill' ? 'rounded-sw-pill' : 'rounded-sw-sm',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
    )
    const content = (
        <>
            {loading ? (
                <Icon icon={LuLoaderCircle} size="sm" className="animate-spin" />
            ) : (
                iconLeft && <Icon icon={iconLeft} size="sm" />
            )}
            <span>{children}</span>
            {iconRight && !loading && <Icon icon={iconRight} size="sm" />}
        </>
    )

    if (to) {
        return (
            <Link ref={ref} to={to} className={classes} {...rest}>
                {content}
            </Link>
        )
    }
    if (href) {
        return (
            <a ref={ref} href={href} className={classes} {...rest}>
                {content}
            </a>
        )
    }
    return (
        <button
            ref={ref}
            type={type || 'button'}
            className={classes}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {content}
        </button>
    )
})

export default Button
