import { useId, useState } from 'react'
import { LuChevronDown } from 'react-icons/lu'
import Icon from './Icon'
import { cx } from './cx'

// Disclosure row. Controlled when `open` is passed (with onToggle), otherwise self-managed.
const AccordionItem = ({ title, meta, open, defaultOpen = false, onToggle, tone = 'light', className, children }) => {
    const [selfOpen, setSelfOpen] = useState(defaultOpen)
    const isOpen = open ?? selfOpen
    const panelId = useId()

    const toggle = () => {
        if (onToggle) onToggle()
        if (open === undefined) setSelfOpen((s) => !s)
    }

    return (
        <div className={cx(tone === 'dark' ? 'border-b border-sw-white/15' : 'border-b border-sw-border-light', className)}>
            <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={toggle}
                className="flex min-h-11 w-full items-center justify-between gap-4 py-3 text-left"
            >
                <span className="flex-1">{title}</span>
                {meta}
                <Icon
                    icon={LuChevronDown}
                    size="sm"
                    className={cx('shrink-0 transition-transform duration-sw ease-sw', isOpen && 'rotate-180')}
                />
            </button>
            <div id={panelId} role="region" hidden={!isOpen} className="pb-4">
                {isOpen && children}
            </div>
        </div>
    )
}

export default AccordionItem
