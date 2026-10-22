import { useRef } from 'react'
import { cx } from './cx'

// Pill tab list with roving focus (Arrow/Home/End). Controlled via value/onChange.
const Tabs = ({ items, value, onChange, label, tone = 'light', className }) => {
    const refs = useRef([])

    const focusAt = (index) => {
        const next = (index + items.length) % items.length
        refs.current[next]?.focus()
        onChange(items[next].id)
    }

    const onKeyDown = (event, index) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); focusAt(index + 1) }
        if (event.key === 'ArrowLeft') { event.preventDefault(); focusAt(index - 1) }
        if (event.key === 'Home') { event.preventDefault(); focusAt(0) }
        if (event.key === 'End') { event.preventDefault(); focusAt(items.length - 1) }
    }

    return (
        <div role="tablist" aria-label={label} className={cx('flex flex-wrap gap-2', className)}>
            {items.map((item, index) => {
                const selected = item.id === value
                return (
                    <button
                        key={item.id}
                        ref={(el) => (refs.current[index] = el)}
                        type="button"
                        role="tab"
                        id={`tab-${item.id}`}
                        aria-selected={selected}
                        aria-controls={item.panelId}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(item.id)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                        className={cx(
                            'inline-flex min-h-11 items-center gap-2 rounded-sw-pill px-4 text-sw-small font-semibold transition-colors duration-sw-fast',
                            tone === 'dark'
                                ? selected ? 'bg-sw-white text-sw-black' : 'bg-sw-glass text-sw-white hover:bg-sw-glass-hover'
                                : selected ? 'bg-sw-black text-sw-white' : 'bg-sw-surface-pill text-sw-black shadow-sw-soft hover:bg-sw-white'
                        )}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}

export default Tabs
