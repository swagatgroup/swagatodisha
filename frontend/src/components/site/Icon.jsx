// Lucide glyphs (react-icons/lu) at the design's sizes and stroke weights.
// Decorative by default; pass `label` when the icon carries meaning on its own.
const SIZES = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 }

const Icon = ({ icon, size = 'sm', strokeWidth, label, className }) => {
    const Glyph = icon
    return (
        <Glyph
            size={SIZES[size] || size}
            strokeWidth={strokeWidth}
            className={className}
            aria-hidden={label ? undefined : true}
            aria-label={label}
            role={label ? 'img' : undefined}
            focusable="false"
        />
    )
}

export default Icon
