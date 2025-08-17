import React from 'react'
import { AnimatePresence } from 'framer-motion'
import PremiumNavigation from './components/PremiumNavigation'
import PremiumHero from './components/PremiumHero'
import PremiumPrograms from './components/PremiumPrograms'

function App() {
    return (
        <div className="App relative">
            <PremiumNavigation />
            <PremiumHero />
            <PremiumPrograms />

            <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Why Choose <span className="text-yellow-400">Swagat</span>?
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Experience the difference that premium education makes in shaping successful careers and building strong foundations for the future.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-12 h-12 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ),
                                title: "Excellence in Education",
                                description: "Consistently delivering high-quality education with proven results and industry recognition."
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                ),
                                title: "Innovation & Technology",
                                description: "Cutting-edge facilities and modern teaching methodologies that prepare students for the future."
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                    </svg>
                                ),
                                title: "Expert Faculty",
                                description: "Learn from industry professionals and experienced educators who are passionate about your success."
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                ),
                                title: "Global Perspective",
                                description: "International collaborations and exposure to diverse cultures and perspectives."
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                                    </svg>
                                ),
                                title: "Career Support",
                                description: "Comprehensive placement assistance and career guidance for every student."
                            },
                            {
                                icon: (
                                    <svg className="w-12 h-12 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ),
                                title: "Proven Track Record",
                                description: "Decades of success with thousands of alumni excelling in their respective fields."
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group cursor-pointer"
                            >
                                <div className="text-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-yellow-300 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-300 leading-relaxed text-center group-hover:text-white transition-colors duration-300">
                                    {feature.description}
                                </p>

                                {/* Interactive Hover Effect */}
                                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48-25.5c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-48-25.5c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25.5c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Ready to Start Your <span className="text-yellow-300">Journey</span>?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                        Join thousands of students who have already transformed their lives through Swagat's premium education experience.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105">
                            Apply Now
                        </button>
                        <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
                            Schedule a Call
                        </button>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-yellow-400 mb-4">Swagat</h3>
                            <p className="text-gray-400">
                                Empowering minds, shaping futures through excellence in education and innovation.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Programs</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Admissions</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Programs</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Engineering</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Management</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Arts & Science</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Research</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                            <div className="space-y-2 text-gray-400">
                                <p>Bhubaneswar, Odisha</p>
                                <p>+91 123 456 7890</p>
                                <p>info@swagat.edu.in</p>
                                <p>www.swagat.edu.in</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-400">&copy; 2024 Swagat Group of Institutions. All rights reserved.</p>

                            {/* Developer Credit */}
                            <div className="text-gray-500 text-sm">
                                Developed by{' '}
                                <a
                                    href="https://www.chanchalpradhan.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 font-bold hover:text-yellow-300 transition-colors duration-100 hover:underline cursor-pointer"
                                >
                                    Chanchal Pradhan
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default App
