import React from 'react'
import ContactUs from './ContactUs'
import BackToMainWebsite from './BackToMainWebsite'

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <BackToMainWebsite variant="floating" />
            <ContactUs />
        </div>
    )
}

export default ContactPage
