import React from 'react'

const ApprovalsRecognitions = () => {
    const approvals = [
        {
            id: 1,
            title: "AICTE Approval",
            description: "All India Council for Technical Education approval for our technical programs",
            icon: "fa-solid fa-certificate",
            color: "from-purple-500 to-blue-500"
        },
        {
            id: 2,
            title: "UGC Recognition",
            description: "University Grants Commission recognition for our degree programs",
            icon: "fa-solid fa-award",
            color: "from-green-500 to-teal-500"
        },
        {
            id: 3,
            title: "State Government Approval",
            description: "Approved by Government of Odisha for all educational programs",
            icon: "fa-solid fa-government",
            color: "from-orange-500 to-red-500"
        },
        {
            id: 4,
            title: "ISO Certification",
            description: "ISO 9001:2015 certified for quality management systems",
            icon: "fa-solid fa-shield-check",
            color: "from-blue-500 to-indigo-500"
        },
        {
            id: 5,
            title: "NAAC Accreditation",
            description: "National Assessment and Accreditation Council accreditation",
            icon: "fa-solid fa-star",
            color: "from-yellow-500 to-orange-500"
        },
        {
            id: 6,
            title: "NIRF Ranking",
            description: "National Institutional Ranking Framework ranking",
            icon: "fa-solid fa-trophy",
            color: "from-pink-500 to-purple-500"
        }
    ]

    const recognitions = [
        {
            id: 1,
            title: "Best Emerging Institution",
            year: "2023",
            organization: "Education Excellence Awards",
            description: "Recognized for innovative teaching methods and student development"
        },
        {
            id: 2,
            title: "Excellence in Technical Education",
            year: "2022",
            organization: "Technical Education Council",
            description: "Awarded for outstanding contribution to technical education"
        },
        {
            id: 3,
            title: "Student Achievement Award",
            year: "2023",
            organization: "State Education Department",
            description: "Recognized for exceptional student performance and achievements"
        },
        {
            id: 4,
            title: "Innovation in Education",
            year: "2022",
            organization: "National Education Forum",
            description: "Awarded for implementing cutting-edge educational technologies"
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                        <i className="fa-solid fa-medal text-white text-3xl"></i>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                        Approvals & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Recognitions</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Swagat Group of Institutions is proud to be recognized and approved by various national and state-level authorities,
                        ensuring the highest standards of education and quality assurance.
                    </p>
                </div>
            </section>

            {/* Approvals Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Approvals</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our institution operates with full regulatory compliance and holds all necessary approvals from recognized authorities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {approvals.map((approval) => (
                            <div key={approval.id} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className={`w-16 h-16 bg-gradient-to-r ${approval.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                    <i className={`${approval.icon} text-white text-2xl`}></i>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{approval.title}</h3>
                                <p className="text-gray-600 text-center leading-relaxed">{approval.description}</p>

                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                        <i className="fa-solid fa-check-circle mr-2"></i>
                                        Approved
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recognitions Section */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Awards & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Recognition</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our commitment to excellence has been recognized through various prestigious awards and accolades.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {recognitions.map((recognition) => (
                            <div key={recognition.id} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-2xl font-bold text-gray-800">{recognition.title}</h3>
                                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                                        {recognition.year}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-purple-600 font-semibold text-lg">{recognition.organization}</p>
                                </div>

                                <p className="text-gray-600 leading-relaxed">{recognition.description}</p>

                                <div className="mt-6 flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                                        <i className="fa-solid fa-trophy text-white text-sm"></i>
                                    </div>
                                    <span className="text-sm text-gray-500">Prestigious Recognition</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quality Assurance Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                                    Quality <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Assurance</span>
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                            <i className="fa-solid fa-shield-check text-white text-xl"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Regular Audits</h3>
                                            <p className="text-gray-600">We undergo regular quality audits to maintain our high standards and compliance.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                            <i className="fa-solid fa-chart-line text-white text-xl"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Continuous Improvement</h3>
                                            <p className="text-gray-600">We continuously improve our processes based on feedback and best practices.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                            <i className="fa-solid fa-users text-white text-xl"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Expert Faculty</h3>
                                            <p className="text-gray-600">Our faculty members are qualified experts with industry experience.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-100">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Commitment</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                        <i className="fa-solid fa-check-circle text-green-600 text-xl mr-4"></i>
                                        <span className="font-semibold text-gray-800">100% Regulatory Compliance</span>
                                    </div>
                                    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                        <i className="fa-solid fa-check-circle text-green-600 text-xl mr-4"></i>
                                        <span className="font-semibold text-gray-800">Quality Education Standards</span>
                                    </div>
                                    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                        <i className="fa-solid fa-check-circle text-green-600 text-xl mr-4"></i>
                                        <span className="font-semibold text-gray-800">Student Success Focus</span>
                                    </div>
                                    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                        <i className="fa-solid fa-check-circle text-green-600 text-xl mr-4"></i>
                                        <span className="font-semibold text-gray-800">Industry Partnerships</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Join Our <span className="text-yellow-300">Recognized</span> Institution
                    </h2>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
                        Choose an institution that's officially recognized and approved by all relevant authorities.
                        Your future is secure with us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                            Apply Now
                        </button>
                        <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300">
                            Learn More
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ApprovalsRecognitions
