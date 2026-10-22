import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'
import Icon from './Icon'
import { cx } from './cx'

const SIZES = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'

let openCount = 0

// Accessible dialog: Esc closes, focus is trapped and restored, page scroll is locked.
// `onClose(event)` runs for Esc and the close button; `onBackdropClick(event)` (defaults
// to onClose) receives the backdrop click so callers can keep their own target checks.
const Modal = ({
    open,
    onClose,
    onBackdropClick,
    title,
    description,
    headerExtra,
    size = 'lg',
    tone = 'light',
    zIndex = 'z-sw-modal',
    closeLabel = 'Close',
    className,
    bodyClassName,
    children,
}) => {
    const panelRef = useRef(null)
    const onCloseRef = useRef(onClose)
    onCloseRef.current = onClose
    const titleId = useId()
    const descId = useId()

    useEffect(() => {
        if (!open) return undefined
        const previous = document.activeElement
        openCount += 1
        document.body.style.overflow = 'hidden'
        panelRef.current?.focus()

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation()
                onCloseRef.current?.(event)
            }
            if (event.key === 'Tab' && panelRef.current) {
                const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null)
                if (nodes.length === 0) return
                const first = nodes[0]
                const last = nodes[nodes.length - 1]
                if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
                    event.preventDefault()
                    last.focus()
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault()
                    first.focus()
                }
            }
        }
        const panel = panelRef.current
        panel?.addEventListener('keydown', onKeyDown)
        return () => {
            panel?.removeEventListener('keydown', onKeyDown)
            openCount -= 1
            if (openCount === 0) document.body.style.overflow = ''
            if (previous && typeof previous.focus === 'function') previous.focus()
        }
    }, [open])

    if (!open) return null

    const dark = tone === 'dark'
    const dialog = (
        <div
            className={cx('fixed inset-0 flex items-end justify-center bg-sw-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4', zIndex)}
            onClick={onBackdropClick || ((event) => event.target === event.currentTarget && onClose?.(event))}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descId : undefined}
                tabIndex={-1}
                className={cx(
                    'flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-sw-md shadow-sw-overlay focus:outline-none sm:rounded-sw-md',
                    dark ? 'bg-sw-black text-sw-text-on-dark ring-1 ring-sw-white/10' : 'bg-sw-white text-sw-text',
                    SIZES[size],
                    className
                )}
                onClick={(event) => event.stopPropagation()}
            >
                {(title || headerExtra) && (
                    <div className={cx('flex items-start gap-4 border-b px-5 py-4 sm:px-6 sm:py-5', dark ? 'border-sw-white/10' : 'border-sw-border-light')}>
                        <div className="min-w-0 flex-1">
                            {headerExtra}
                            {title && (
                                <h2 id={titleId} className="text-sw-h3 font-bold">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id={descId} className={cx('mt-1 text-sw-body', dark ? 'text-sw-text-on-dark-secondary' : 'text-sw-text-muted')}>
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={(event) => onClose?.(event)}
                            aria-label={closeLabel}
                            className={cx(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-sw-pill transition-colors duration-sw-fast',
                                dark ? 'bg-sw-white/10 hover:bg-sw-white/20' : 'bg-sw-gray-50 hover:bg-sw-gray-100'
                            )}
                        >
                            <Icon icon={LuX} size="sm" />
                        </button>
                    </div>
                )}
                <div className={cx('min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6', bodyClassName)}>{children}</div>
            </div>
        </div>
    )

    // Render inside the `.site` scope so the design tokens/base styles apply
    const target = typeof document !== 'undefined' ? document.getElementById('sw-portal') : null
    return target ? createPortal(dialog, target) : dialog
}

export default Modal
