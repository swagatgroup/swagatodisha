import { cx } from './cx'

const SECTION_TONES = {
    light: 'bg-sw-white text-sw-text',
    muted: 'bg-sw-surface-muted text-sw-text',
    dark: 'bg-sw-black text-sw-text-on-dark',
}

// 992px measure with responsive gutters (`wide` = 1044px panel width)
export const Container = ({ as = 'div', wide = false, className, children, ...rest }) => {
    const Tag = as
    return (
        <Tag className={cx(wide ? 'sw-container-wide' : 'sw-container', className)} {...rest}>
            {children}
        </Tag>
    )
}

export const Section = ({ as = 'section', tone = 'light', className, children, ...rest }) => {
    const Tag = as
    return (
        <Tag className={cx('sw-section relative', SECTION_TONES[tone], className)} {...rest}>
            {children}
        </Tag>
    )
}

// Centred H2 + subtitle stack used by every section in the Figma
export const SectionHeader = ({
    title,
    subtitle,
    as = 'h2',
    align = 'center',
    tone = 'light',
    id,
    className,
    children,
}) => {
    const Heading = as
    return (
        <header className={cx('mb-10 md:mb-14 lg:mb-16', align === 'center' ? 'text-center' : 'text-left', className)}>
            <Heading id={id} className="text-sw-h2 font-bold">
                {title}
            </Heading>
            {subtitle && (
                <p
                    className={cx(
                        'text-sw-subtitle font-normal',
                        align === 'center' && 'mx-auto max-w-[42rem]',
                        tone === 'dark' ? 'text-sw-text-on-dark-secondary' : 'text-sw-text'
                    )}
                >
                    {subtitle}
                </p>
            )}
            {children}
        </header>
    )
}
