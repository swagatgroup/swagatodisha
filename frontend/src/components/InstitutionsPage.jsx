import React from 'react'
import { INSTITUTION_TYPES } from '../utils/constants'

const InstitutionsPage = () => {
    const institutions = [
        {
            name: "Swagat Public School Sinapali",
            type: "School",
            location: "Sinapali, Nuapada, Odisha",
            description: "Primary and secondary education with modern teaching methodologies",
            image: "/slider1.jpg",
            features: ["Smart Classrooms", "Sports Facilities", "Computer Lab", "Library"]
        },
        {
            name: "Swagat Higher Secondary School",
            type: "Higher Secondary",
            location: "Sargiguda, Balangir, Odisha",
            description: "Comprehensive higher secondary education with multiple streams",
            image: "/slider2.jpg",
            features: ["Science Stream", "Commerce Stream", "Arts Stream", "Career Guidance"]
        },
        {
            name: "Swagat Degree College",
            type: "Degree College",
            location: "Sargiguda, Balangir, Odisha",
            description: "Undergraduate programs in various disciplines",
            image: "/slider3.jpg",
            features: ["B.A. Programs", "B.Sc. Programs", "B.Com Programs", "Research Facilities"]
        },
        {
            name: "Swagat Engineering College",
            type: "Engineering",
            location: "Sargiguda, Balangir, Odisha",
            description: "Technical education with industry-focused curriculum",
            image: "/slider4.jpg",
            features: ["Computer Science", "Mechanical Engineering", "Civil Engineering", "Electronics"]
        },
        {
            name: "Swagat Management School",
            type: "Management",
            location: "Sargiguda, Balangir, Odisha",
            description: "Business and management education for future leaders",
            image: "/slider5.jpg",
            features: ["MBA Programs", "BBA Programs", "Industry Projects", "Placement Support"]
        },
        {
            name: "Swagat Polytechnic",
            type: "Polytechnic",
            location: "Sargiguda, Balangir, Odisha",
            description: "Diploma programs in technical fields",
            image: "/slider6.jpg",
            features: ["Diploma Programs", "Practical Training", "Workshop Facilities", "Industry Connect"]
        }
    ]

    const facilities = [
        {
            title: "Modern Classrooms",
            description: "Smart classrooms equipped with latest technology",
            icon: "fa-solid fa-chalkboard",
            color: "from-purple-500 to-blue-500"
        },
        {
            title: "Laboratories",
            description: "Well-equipped labs for practical learning",
            icon: "fa-solid fa-flask",
            color: "from-green-500 to-teal-500"
        },
        {
            title: "Library",
            description: "Extensive collection of books and digital resources",
            icon: "fa-solid fa-book",
            color: "from-orange-500 to-red-500"
        },
        {
            title: "Sports Complex",
            description: "Multiple sports facilities for physical development",
            icon: "fa-solid fa-futbol",
            color: "from-blue-500 to-indigo-500"
        },
        {
            title: "Computer Center",
            description: "Latest computer facilities and software",
            icon: "fa-solid fa-laptop",
            color: "from-pink-500 to-purple-500"
        },
        {
            title: "Auditorium",
            description: "Large auditorium for events and functions",
            icon: "fa-solid fa-microphone",
            color: "from-yellow-500 to-orange-500"
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
                        <i className="fa-solid fa-school text-white text-3xl"></i>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Institutions</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Discover our diverse range of educational institutions, each designed to provide
                        specialized education and prepare students for successful careers in their chosen fields.
                    </p>
                </div>
            </section>

            {/* Institution Types Overview */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Educational <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Categories</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We offer comprehensive education across multiple levels and disciplines.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {INSTITUTION_TYPES.map((type) => (
                            <div key={type.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: type.color }}
                                >
                                    <i className={`${type.icon} text-white text-2xl`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{type.name}</h3>
                                <ul className="text-gray-600 text-sm space-y-1">
                                    {type.institutions.map((institution, index) => (
                                        <li key={index} className="flex items-center">
                                            <i className="fa-solid fa-check text-green-500 mr-2 text-xs"></i>
                                            {institution}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Individual Institutions */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Campuses</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Each campus is designed to provide the best learning environment for our students.
                        </p>
                    </div>

                    <div className="space-y-12 max-w-6xl mx-auto">
                        {institutions.map((institution, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                                    } flex flex-col lg:flex-row gap-8 items-center`}
                            >
                                <div className="lg:w-1/2">
                                    <div className="relative">
                                        <img
                                            src={institution.image}
                                            alt={institution.name}
                                            className="w-full h-64 object-cover rounded-2xl shadow-lg"
                                        />
                                        <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                            {institution.type}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-1/2">
                                    <h3 className="text-3xl font-bold text-gray-800 mb-4">{institution.name}</h3>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <i className="fa-solid fa-map-marker-alt mr-2 text-purple-600"></i>
                                        {institution.location}
                                    </div>
                                    <p className="text-gray-600 leading-relaxed mb-6">{institution.description}</p>

                                    <div className="grid grid-cols-2 gap-3">
                                        {institution.features.map((feature, featureIndex) => (
                                            <div key={featureIndex} className="flex items-center">
                                                <i className="fa-solid fa-check text-green-500 mr-2 text-sm"></i>
                                                <span className="text-gray-700 text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Facilities Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            World-Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Facilities</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our campuses are equipped with modern facilities to enhance the learning experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {facilities.map((facility, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <div className={`w-16 h-16 bg-gradient-to-r ${facility.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                    <i className={`${facility.icon} text-white text-2xl`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{facility.title}</h3>
                                <p className="text-gray-600 text-center leading-relaxed">{facility.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-school text-white text-2xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-2">6+</h3>
                            <p className="text-gray-600">Institutions</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-user-graduate text-white text-2xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-2">1000+</h3>
                            <p className="text-gray-600">Students</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-chalkboard-user text-white text-2xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-2">50+</h3>
                            <p className="text-gray-600">Faculty Members</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-trophy text-white text-2xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-2">25+</h3>
                            <p className="text-gray-600">Programs</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Choose Your <span className="text-yellow-300">Educational</span> Path
                    </h2>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
                        With multiple institutions and programs, we have the perfect educational path for every student.
                        Start your journey with us today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                            Apply Now
                        </button>
                        <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300">
                            Schedule a Visit
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default InstitutionsPage
