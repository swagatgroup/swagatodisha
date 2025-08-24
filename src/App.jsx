import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import HeroCarousel from './components/HeroCarousel'
import AboutUs from './components/AboutUs'
import InstitutionTypes from './components/InstitutionTypes'
import Admissions from './components/Admissions'
// import Milestone from './components/Milestone'
// import Gallery from './components/Gallery'
import QuickLinks from './components/QuickLinks'
import ChairmanMessage from './components/ChairmanMessage'
import Management from './components/Management'
import Location from './components/Location'
import ContactUs from './components/ContactUs'
import Footer from './components/Footer'
import PremiumFloatingElements from './components/PremiumFloatingElements'

function App() {
    const [isNavOpen, setIsNavOpen] = useState(false)

    return (
        <div className="App relative">
            {/* Premium Floating Elements - Global Animation Layer */}
            <PremiumFloatingElements />

            <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
            <section id="home">
                <HeroCarousel />
            </section>

            {/* About Us with Clean Background */}
            <section id="about" className="section-bg">
                <AboutUs />
            </section>

            {/* Institution Types with Clean Background */}
            <section id="programs" className="bg-subtle-gradient">
                <InstitutionTypes />
            </section>

            {/* Quick Links with Clean Background */}
            <section className="bg-warm-gradient">
                <QuickLinks />
            </section>

            {/* Admissions Section with Clean Background */}
            <section id="admissions" className="bg-cool-gradient">
                <Admissions />
            </section>

            {/* Milestone Section */}
            {/* <Milestone /> */}

            {/* Gallery Section */}
            {/* <Gallery /> */}

            {/* Chairman Message Section with Clean Background */}
            <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
                {/* Clean Background Overlay */}
                <div className="absolute inset-0 bg-white/5"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <ChairmanMessage />
                </div>
            </section>

            {/* Management Team Section with Clean Background */}
            <section className="bg-purple-gradient">
                <Management />
            </section>

            {/* Location Section with Clean Background */}
            <section id="contact" className="py-20 bg-clean-white">
                <div className="container mx-auto px-6">
                    <Location />
                </div>
            </section>

            {/* Contact Us Section with Clean Background */}
            <section className="bg-subtle-gradient">
                <ContactUs />
            </section>

            {/* Footer with Clean Background */}
            <section className="bg-warm-gradient">
                <Footer />
            </section>
        </div>
    )
}

export default App
