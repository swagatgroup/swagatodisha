import React from 'react'
import { CHAIRMAN_MESSAGE } from '../utils/constants'

const ChairmanMessage = () => {
    const chairmanData = {
        name: CHAIRMAN_MESSAGE.name,
        position: CHAIRMAN_MESSAGE.position,
        message: "At Swagat Group of Institutions, we believe in nurturing not just academic excellence, but the complete development of every student. Our commitment to quality education, innovative teaching methods, and holistic growth has made us a trusted name in education for over two decades.",
        achievements: [
            "25+ Years of Educational Excellence",
            "50,000+ Students Successfully Placed",
            "100+ Industry Partnerships",
            "Award-Winning Teaching Methods"
        ],
        image: CHAIRMAN_MESSAGE.image,
        icon: "fa-solid fa-crown"
    }

    return (
        <section className="py-16">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-xl">
                        <i className={`${chairmanData.icon} text-white text-2xl`}></i>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
                        Chairman's <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Message</span>
                    </h2>

                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        A vision for excellence, innovation, and student success
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center">
                        {/* Chairman Image and Info */}
                        <div className="text-center lg:text-left order-2 lg:order-1">
                            {/* Logo/Image */}
                            <div className="mb-6">
                                <img
                                    src={chairmanData.image}
                                    alt="Chairman"
                                    className="w-48 md:w-60 rounded-full h-full object-contain mx-auto lg:mx-0"
                                />
                            </div>

                            {/* Chairman Details */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {chairmanData.name}
                                </h3>
                                <p className="text-base text-purple-600 font-medium mb-3">
                                    {chairmanData.position}
                                </p>
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className="space-y-4 order-1 lg:order-2">
                            {/* Main Message */}
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-start mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                        <i className="fa-solid fa-quote-left text-white text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="text-base text-gray-700 leading-relaxed italic">
                                            {chairmanData.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Achievement Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-white rounded-lg shadow-md border border-gray-100">
                                    <div className="text-xl font-bold text-purple-600 mb-1">25+</div>
                                    <div className="text-xs text-gray-600">Years</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg shadow-md border border-gray-100">
                                    <div className="text-xl font-bold text-blue-600 mb-1">50K+</div>
                                    <div className="text-xs text-gray-600">Students</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-12">
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300">
                        Learn More About Us
                    </button>
                </div>
            </div>
        </section>
    )
}

export default ChairmanMessage
