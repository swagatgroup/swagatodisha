import React from 'react'

const Admissions = () => {
    return (
        <section id="admissions" className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                        Join <span className="text-blue-600">Swagat</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Begin your educational journey with us. Discover the admission process and requirements for our various programs.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Admission Process */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-file-alt text-2xl text-blue-600"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Application Process</h3>
                            <p className="text-gray-600">
                                Complete the online application form with required documents and submit for review.
                            </p>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-check-circle text-2xl text-purple-600"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Requirements</h3>
                            <p className="text-gray-600">
                                Academic transcripts, certificates, and other supporting documents as per program requirements.
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-phone text-2xl text-green-600"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Get in Touch</h3>
                            <p className="text-gray-600">
                                Contact our admissions team for personalized guidance and support throughout the process.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        Apply Now
                    </button>
                    <p className="text-gray-600 mt-4">
                        For more information, call us at <span className="font-semibold">+91 9403891555</span>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Admissions
