import { useState } from 'react'
import { cx } from './cx'

// Image slot for the redesign photography (see redesignImages.js).
// Shows a dark gradient placeholder when there's no file (src is null), and
// fades the image in once loaded. Desktop + optional mobile art direction via <picture>.
const SmartImage = ({
    as = 'div',
    src,
    mobileSrc,
    alt = '',
    width,
    height,
    priority = false,
    placeholder = 'night',
    className,
    imgClassName,
    sizes,
}) => {
    const [status, setStatus] = useState('loading')
    const Tag = as
    // Fall back to whichever variant exists
    const desktop = src || mobileSrc
    const mobile = src ? mobileSrc : null

    return (
        <Tag
            className={cx(
                // positioned for the absolute <img>, unless the caller already positions the slot
                !/\b(absolute|fixed)\b/.test(className || '') && 'relative',
                'block overflow-hidden',
                `sw-ph-${placeholder}`,
                className
            )}
        >
            {desktop && status !== 'error' && (
                <picture>
                    {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
                    <img
                        src={desktop}
                        alt={alt}
                        width={width}
                        height={height}
                        sizes={sizes}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchpriority={priority ? 'high' : undefined}
                        decoding="async"
                        onLoad={() => setStatus('loaded')}
                        onError={() => setStatus('error')}
                        className={cx(
                            'absolute inset-0 h-full w-full object-cover transition-opacity duration-sw-slow',
                            status === 'loaded' ? 'opacity-100' : 'opacity-0',
                            imgClassName
                        )}
                    />
                </picture>
            )}
        </Tag>
    )
}

export default SmartImage
