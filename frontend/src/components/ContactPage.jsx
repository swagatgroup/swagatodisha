import React from 'react'
import ContactUs from './ContactUs'
import BackToMainWebsite from './BackToMainWebsite'

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            <BackToMainWebsite variant="floating" />
            <ContactUs />
        </div>
    )
}

export default ContactPage
