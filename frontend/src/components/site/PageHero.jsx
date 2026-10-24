import { cx } from './cx'

// Black title band for inner pages; sits under the transparent fixed header
const PageHero = ({ title, intro, eyebrow, children, className }) => (
    <section className={cx('sw-deco-navy bg-sw-black text-sw-text-on-dark', className)}>
        <div className="sw-container pb-14 pt-[calc(var(--sw-header-h)+2.5rem)] text-center lg:pb-20 lg:pt-[calc(var(--sw-header-h)+4rem)]">
            {eyebrow && <div className="mb-4 flex justify-center">{eyebrow}</div>}
            <h1 className="text-sw-display font-bold">{title}</h1>
            {intro && (
                <p className="mx-auto mt-4 max-w-3xl text-sw-subtitle text-sw-text-on-dark-secondary">{intro}</p>
            )}
            {children}
        </div>
    </section>
)

export default PageHero
