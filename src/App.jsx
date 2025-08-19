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

function App() {
    const [isNavOpen, setIsNavOpen] = useState(false)

    return (
        <div className="App relative">
            <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
            <HeroCarousel />
            <AboutUs />
            <InstitutionTypes />
            <QuickLinks />

            {/* Admissions Section */}
            <Admissions />

            {/* Milestone Section */}
            {/* <Milestone /> */}

            {/* Gallery Section */}
            {/* <Gallery /> */}

            {/* Chairman Message Section */}
            <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600">
                <div className="container mx-auto px-6">
                    <ChairmanMessage />
                </div>
            </section>

            {/* Management Team Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                            Our <span className="text-purple-600">Leadership</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Meet the dedicated team driving innovation and excellence in education
                        </p>
                    </div>
                    <Management />
                </div>
            </section>

            {/* Location Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <Location />
                </div>
            </section>

            {/* Contact Us Section */}
            <ContactUs />

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default App
