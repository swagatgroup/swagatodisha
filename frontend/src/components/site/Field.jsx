import { forwardRef, useId } from 'react'
import { LuChevronDown } from 'react-icons/lu'
import Icon from './Icon'
import { cx } from './cx'

// White, borderless, short hard shadow: the Figma input style
const CONTROL = cx(
    'block w-full rounded-sw-sm bg-sw-white px-4 text-sw-body text-sw-text shadow-sw-input',
    'ring-1 ring-inset ring-transparent transition-shadow duration-sw-fast',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-sw-focus',
    'disabled:cursor-not-allowed disabled:bg-sw-gray-50 disabled:text-sw-text-muted'
)

// Label + control + hint/error wrapper. `hideLabel` keeps the label for
// screen readers while matching the placeholder-only look of the Figma.
const FieldShell = ({ id, label, hideLabel, required, hint, error, className, children }) => (
    <div className={cx('flex flex-col gap-1.5', className)}>
        {label && (
            <label htmlFor={id} className={cx('text-sw-small font-semibold text-sw-text', hideLabel && 'sr-only')}>
                {label}
                {required && <span aria-hidden="true"> *</span>}
            </label>
        )}
        {children}
        {error ? (
            <p id={`${id}-error`} className="text-sw-small text-sw-error">
                {error}
            </p>
        ) : (
            hint && (
                <p id={`${id}-hint`} className="text-sw-caption text-sw-text-muted">
                    {hint}
                </p>
            )
        )}
    </div>
)

const describedBy = (id, hint, error) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined)

export const Input = forwardRef(function Input(
    { id, label, hideLabel, hint, error, required, className, inputClassName, ...rest },
    ref
) {
    const autoId = useId()
    const fieldId = id || autoId
    return (
        <FieldShell id={fieldId} label={label} hideLabel={hideLabel} required={required} hint={hint} error={error} className={className}>
            <input
                ref={ref}
                id={fieldId}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(fieldId, hint, error)}
                className={cx(CONTROL, 'min-h-11 py-2', error && 'ring-sw-error', inputClassName)}
                {...rest}
            />
        </FieldShell>
    )
})

export const Textarea = forwardRef(function Textarea(
    { id, label, hideLabel, hint, error, required, rows = 4, className, inputClassName, ...rest },
    ref
) {
    const autoId = useId()
    const fieldId = id || autoId
    return (
        <FieldShell id={fieldId} label={label} hideLabel={hideLabel} required={required} hint={hint} error={error} className={className}>
            <textarea
                ref={ref}
                id={fieldId}
                rows={rows}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(fieldId, hint, error)}
                className={cx(CONTROL, 'resize-y py-3', error && 'ring-sw-error', inputClassName)}
                {...rest}
            />
        </FieldShell>
    )
})

export const Select = forwardRef(function Select(
    { id, label, hideLabel, hint, error, required, className, inputClassName, children, ...rest },
    ref
) {
    const autoId = useId()
    const fieldId = id || autoId
    return (
        <FieldShell id={fieldId} label={label} hideLabel={hideLabel} required={required} hint={hint} error={error} className={className}>
            <div className="relative">
                <select
                    ref={ref}
                    id={fieldId}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy(fieldId, hint, error)}
                    className={cx(CONTROL, 'min-h-11 appearance-none py-2 pr-10', error && 'ring-sw-error', inputClassName)}
                    {...rest}
                >
                    {children}
                </select>
                <Icon icon={LuChevronDown} size="sm" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sw-text-muted" />
            </div>
        </FieldShell>
    )
})

