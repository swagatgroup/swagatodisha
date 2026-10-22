import React from 'react'
import ContactUs from './ContactUs'
import PageHero from './site/PageHero'

const ContactPage = () => {
    return (
        <div>
            <PageHero
                title="Contact Us"
                intro="We're here to help and answer any questions you might have. We look forward to hearing from you."
            />
            <ContactUs />
        </div>
    )
}

export default ContactPage
