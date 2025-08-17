import React, { useState, useCallback, useMemo } from 'react'

const InstitutionTypes = () => {
    const [selectedInstitution, setSelectedInstitution] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const institutions = [
        {
            name: "School",
            subtitle: "Primary & Secondary Education",
            description: "Comprehensive education from primary to secondary levels with modern teaching methodologies and holistic development focus.",
            icon: "fa-solid fa-school",
            iconBg: "from-green-500 to-emerald-600",
            color: "green",
            programs: [
                "Swagat Public School Sinapali"
            ]
        },
        {
            name: "Higher Secondary School",
            subtitle: "Advanced Secondary Education",
            description: "Specialized higher secondary education with focus on academic excellence and career preparation.",
            icon: "fa-solid fa-graduation-cap",
            iconBg: "from-blue-500 to-cyan-600",
            color: "blue",
            programs: [
                "BBOSE",
                "NIOS",
                "Central Sanskrit University"
            ]
        },
        {
            name: "Degree College",
            subtitle: "Undergraduate Programs",
            description: "Comprehensive degree programs across various disciplines with industry-aligned curriculum and expert faculty.",
            icon: "fa-solid fa-university",
            iconBg: "from-purple-500 to-indigo-600",
            color: "purple",
            programs: [
                "Capital University",
                "YBN University",
                "MATS University",
                "J.S. University"
            ]
        },
        {
            name: "Management School",
            subtitle: "Business & Management Education",
            description: "Professional management education with practical business insights and leadership development programs.",
            icon: "fa-solid fa-briefcase",
            iconBg: "from-orange-500 to-red-600",
            color: "orange",
            programs: [
                "Capital University",
                "YBN University",
                "MATS University",
                "J.S. University"
            ]
        },
        {
            name: "Engineering College",
            subtitle: "Technical Engineering Education",
            description: "State-of-the-art engineering programs with modern laboratories and industry partnerships for practical learning.",
            icon: "fa-solid fa-cogs",
            iconBg: "from-indigo-500 to-purple-600",
            color: "indigo",
            programs: [
                "Capital University",
                "YBN University",
                "MATS University",
                "J.S. University"
            ]
        },
        {
            name: "Polytechnic",
            subtitle: "Diploma Programs",
            description: "Practical diploma programs in various technical fields with hands-on training and industry exposure.",
            icon: "fa-solid fa-tools",
            iconBg: "from-teal-500 to-green-600",
            color: "teal",
            programs: [
                "Capital University",
                "YBN University",
                "MATS University",
                "J.S. University"
            ]
        },
        {
            name: "B.Ed. College",
            subtitle: "Teacher Education",
            description: "Professional teacher training programs with modern pedagogical approaches and practical teaching experience.",
            icon: "fa-solid fa-chalkboard-teacher",
            iconBg: "from-pink-500 to-rose-600",
            color: "pink",
            programs: [
                "Acharya Nagarjuna University",
                "Andhra University",
                "MATS University",
                "Rayalaseema University"
            ]
        },
        {
            name: "Computer Academy",
            subtitle: "IT & Computer Training",
            description: "Specialized computer training programs with latest technology curriculum and industry-standard certifications.",
            icon: "fa-solid fa-laptop-code",
            iconBg: "from-gray-500 to-slate-600",
            color: "gray",
            programs: [
                "RCTI",
                "NCTI"
            ]
        }
    ]

    const openModal = useCallback((institution) => {
        setSelectedInstitution(institution)
        setIsModalOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsModalOpen(false)
        setSelectedInstitution(null)
    }, [])

    return (
        <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
            </div>

            {/* Section Header */}
            <div className="relative z-10 text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                    <i className="fa-solid fa-building-columns text-white text-3xl"></i>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Institution Types</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                    Discover our comprehensive range of educational institutions, each designed to provide specialized learning experiences and prepare students for successful careers.
                </p>
            </div>

            {/* Institutions Grid */}
            <div className="relative z-10 container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {institutions.map((institution, index) => (
                        <div
                            key={institution.name}
                            onClick={() => openModal(institution)}
                            className="group cursor-pointer bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 active:scale-95"
                        >
                            {/* Icon Container */}
                            <div className={`w-16 h-16 bg-gradient-to-r ${institution.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <i className={`${institution.icon} text-white text-2xl`}></i>
                            </div>

                            {/* Content */}
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                                    {institution.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3 font-medium">
                                    {institution.subtitle}
                                </p>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    {institution.description}
                                </p>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optimized Modal */}
            {isModalOpen && selectedInstitution && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-200 scale-100 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 bg-gradient-to-r ${selectedInstitution.iconBg} rounded-xl flex items-center justify-center`}>
                                        <i className={`${selectedInstitution.icon} text-white text-xl`}></i>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">{selectedInstitution.name}</h3>
                                        <p className="text-gray-600">{selectedInstitution.subtitle}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-gray-300"
                                >
                                    <i className="fa-solid fa-times text-gray-600"></i>
                                </button>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{selectedInstitution.description}</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Available Programs</h4>
                            <div className="space-y-3">
                                {selectedInstitution.programs.map((program, index) => (
                                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                                        <div className={`w-3 h-3 bg-gradient-to-r ${selectedInstitution.iconBg} rounded-full mr-3`}></div>
                                        <span className="text-gray-700 font-medium">{program}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Close
                                </button>
                                <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default InstitutionTypes