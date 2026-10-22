import { useState } from 'react'
import { cx } from './cx'

// Image slot for the redesign photography (public/images/redesign/).
// Shows a dark gradient placeholder until the file exists, then the image
// fades in. Desktop + optional mobile art direction via <picture>.
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
            {status !== 'error' && (
                <picture>
                    {mobileSrc && <source media="(max-width: 767px)" srcSet={mobileSrc} type="image/webp" />}
                    <img
                        src={src}
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
