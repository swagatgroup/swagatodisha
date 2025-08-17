import React from 'react'
import { APP_CONFIG } from '../utils/constants'

const AboutUs = () => {
    return (
        <section id="about-us" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                        About <span className="text-purple-600">Us</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Discover the story behind Swagat Group of Institutions and our commitment to educational excellence
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* About Content */}
                    <div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-6">
                            {APP_CONFIG.name}
                        </h3>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Swagat Group of Institutions is a premier educational organization committed to providing
                            quality education and fostering innovation in the field of learning. Our journey began with
                            a vision to revolutionize education and create opportunities for students to excel in their chosen fields.
                        </p>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            We believe in the power of education to transform lives and communities. Our comprehensive
                            range of institutions covers every aspect of learning, from primary education to higher studies,
                            ensuring that students receive the best possible foundation for their future.
                        </p>

                        <div className="grid grid-cols-2 gap-6 mt-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i className="fa-solid fa-graduation-cap text-2xl text-purple-600"></i>
                                </div>
                                <h4 className="font-semibold text-gray-800">Quality Education</h4>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i className="fa-solid fa-lightbulb text-2xl text-blue-600"></i>
                                </div>
                                <h4 className="font-semibold text-gray-800">Innovation</h4>
                            </div>
                        </div>
                    </div>

                    {/* About Image */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-8 text-white text-center">
                            <div className="mb-6">
                                <i className="fa-solid fa-building-columns text-6xl text-white/80"></i>
                            </div>
                            <h4 className="text-2xl font-bold mb-4">Our Mission</h4>
                            <p className="text-white/90 leading-relaxed">
                                To provide accessible, high-quality education that empowers students to become
                                responsible citizens and successful professionals, contributing to the development
                                of society through innovation and excellence.
                            </p>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-300 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-star text-2xl text-purple-800"></i>
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-300 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-heart text-xl text-white"></i>
                        </div>
                    </div>
                </div>

                {/* Values Section
                <div className="mt-20">
                    <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Core Values</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-users text-3xl text-purple-600"></i>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-3">Excellence</h4>
                            <p className="text-gray-600">Striving for the highest standards in everything we do</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-lightbulb text-3xl text-blue-600"></i>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-3">Innovation</h4>
                            <p className="text-gray-600">Embracing new ideas and creative approaches to learning</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-handshake text-3xl text-green-600"></i>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-3">Integrity</h4>
                            <p className="text-gray-600">Maintaining the highest ethical standards in all our actions</p>
                        </div>
                    </div>
                </div> */}
            </div>
        </section>
    )
}

export default AboutUs
