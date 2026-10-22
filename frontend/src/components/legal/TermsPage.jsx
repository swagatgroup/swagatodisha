import TermsAndConditions from './TermsAndConditions'
import PageHero from '../site/PageHero'
import Card from '../site/Card'

// Public /terms-and-conditions page. The terms component itself is shared with
// the registration forms, so it is wrapped here rather than restyled.
const TermsPage = () => (
    <div>
        <PageHero title="Terms and Conditions" />
        <div className="sw-container sw-section">
            <Card variant="outline" className="mx-auto max-w-3xl p-5 md:p-8 [&_.max-h-96]:max-h-none [&_.max-h-96]:overflow-visible">
                <TermsAndConditions />
            </Card>
        </div>
    </div>
)

export default TermsPage
