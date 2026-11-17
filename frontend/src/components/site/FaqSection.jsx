import { Helmet } from 'react-helmet-async'
import { LuChevronDown } from 'react-icons/lu'
import { faqJsonLd } from '../../data/faqs'
import { absoluteUrl } from '../../seo/routes'
import { Container, SectionHeader } from './Layout'
import Icon from './Icon'

// Visible FAQ plus matching FAQPage structured data for the page it is on
const FaqSection = ({ id, title, subtitle, items, path, className = 'bg-sw-surface-muted' }) => (
    <div className={`sw-section relative ${className}`}>
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(faqJsonLd(items, absoluteUrl(path)))}</script>
        </Helmet>
        <Container>
            <SectionHeader id={id} title={title} subtitle={subtitle} />
            <div className="mx-auto max-w-3xl space-y-3">
                {items.map((item) => (
                    <details key={item.q} className="group rounded-sw-md bg-sw-white p-4 ring-1 ring-inset ring-sw-border-light open:shadow-sw-soft">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                            <h3 className="text-sw-body font-semibold">{item.q}</h3>
                            <Icon icon={LuChevronDown} size="sm" className="shrink-0 transition-transform duration-sw group-open:rotate-180" />
                        </summary>
                        <p className="mt-2 text-sw-body text-sw-text-secondary">{item.a}</p>
                    </details>
                ))}
            </div>
        </Container>
    </div>
)

export default FaqSection
