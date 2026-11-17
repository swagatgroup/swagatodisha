import { HOME_FAQS } from '../../data/faqs'
import FaqSection from '../site/FaqSection'

const HomeFaq = () => (
    <FaqSection
        id="faq-title"
        path="/"
        title="Questions Students Ask Us"
        subtitle="Quick answers about our campuses, courses and admissions across western Odisha."
        items={HOME_FAQS}
    />
)

export default HomeFaq
