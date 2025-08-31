import React from 'react'

const AboutUsPage = () => {
    const milestones = [
        {
            year: '2021',
            title: 'Foundation',
            description: 'Swagat Group of Institutions was established with a vision to provide quality education',
            icon: 'fa-solid fa-seedling'
        },
        {
            year: '2022',
            title: 'Expansion',
            description: 'Added multiple institutions and programs to serve diverse educational needs',
            icon: 'fa-solid fa-building'
        },
        {
            year: '2023',
            title: 'Recognition',
            description: 'Received multiple awards and recognitions for excellence in education',
            icon: 'fa-solid fa-trophy'
        },
        {
            year: '2024',
            title: 'Innovation',
            description: 'Introduced cutting-edge technology and modern teaching methodologies',
            icon: 'fa-solid fa-lightbulb'
        }
    ]

    const values = [
        {
            title: 'Excellence',
            description: 'We strive for excellence in everything we do, from academics to student development',
            icon: 'fa-solid fa-star',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            title: 'Innovation',
            description: 'Embracing new technologies and methodologies to enhance learning experiences',
            icon: 'fa-solid fa-lightbulb',
            color: 'from-blue-500 to-indigo-500'
        },
        {
            title: 'Integrity',
            description: 'Maintaining the highest standards of honesty and ethical behavior',
            icon: 'fa-solid fa-shield-check',
            color: 'from-green-500 to-teal-500'
        },
        {
            title: 'Community',
            description: 'Building strong relationships with students, parents, and the community',
            icon: 'fa-solid fa-users',
            color: 'from-purple-500 to-pink-500'
        }
    ]

    const team = [
        {
            name: 'Mr. G. Meher',
            position: 'Chairman',
            image: '/chairman.jpg',
            description: 'Visionary leader with over 20 years of experience in education'
        },
        {
            name: 'Mr. R.K. Meher',
            position: 'Trustee',
            image: '/chairman_rk.jpg',
            description: 'Dedicated trustee committed to educational excellence'
        },
        {
            name: 'Mrs. Manjula Meher',
            position: 'Principal',
            image: '/mnt_003.jpg',
            description: 'Experienced educator focused on student success'
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
                        <i className="fa-solid fa-info-circle text-white text-3xl"></i>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Us</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        Swagat Group of Institutions is a premier educational organization committed to providing
                        quality education and fostering innovation in learning. We believe in empowering students
                        to achieve their dreams through comprehensive education and personal development.
                    </p>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-100">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <i className="fa-solid fa-bullseye text-white text-2xl"></i>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Our Mission</h2>
                            <p className="text-gray-600 text-center leading-relaxed">
                                To provide world-class education that empowers students with knowledge, skills, and values
                                necessary to become responsible global citizens and successful professionals.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <i className="fa-solid fa-eye text-white text-2xl"></i>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Our Vision</h2>
                            <p className="text-gray-600 text-center leading-relaxed">
                                To be a leading educational institution recognized for academic excellence, innovation,
                                and commitment to student success, shaping the future of education in India.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Values</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            The core principles that guide our institution and shape our educational approach.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                    <i className={`${value.icon} text-white text-2xl`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{value.title}</h3>
                                <p className="text-gray-600 text-center text-sm leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Milestones Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Journey</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Key milestones that mark our growth and success in the field of education.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>

                            <div className="space-y-12">
                                {milestones.map((milestone, index) => (
                                    <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className="w-1/2 px-8">
                                            <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl mb-3">
                                                    <i className={`${milestone.icon} text-white text-lg`}></i>
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{milestone.title}</h3>
                                                <p className="text-gray-600 text-sm leading-relaxed">{milestone.description}</p>
                                            </div>
                                        </div>

                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center z-10 relative">
                                            <span className="text-white font-bold text-sm">{milestone.year}</span>
                                        </div>

                                        <div className="w-1/2 px-8"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Leadership <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Team</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Meet the dedicated leaders who guide our institution towards excellence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{member.name}</h3>
                                <p className="text-purple-600 font-semibold text-center mb-3">{member.position}</p>
                                <p className="text-gray-600 text-center text-sm leading-relaxed">{member.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                                    Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Us</span>
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                            <i className="fa-solid fa-graduation-cap text-white text-xl"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Quality Education</h3>
                                            <p className="text-gray-600">We provide world-class education with modern curriculum and experienced faculty.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                            <i className="fa-solid fa-users text-white text-xl"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Personal Attention</h3>
                                            <p className="text-gray-600">Small class sizes ensure individual attention and personalized learning experiences.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                                            <i className="fa-solid fa-laptop text-white text-xl"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Modern Facilities</h3>
                                            <p className="text-gray-600">State-of-the-art infrastructure with latest technology and learning resources.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border border-purple-100">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Achievements</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                        <i className="fa-solid fa-trophy text-purple-600 text-xl mr-4"></i>
                                        <div>
                                            <h5 className="font-semibold text-gray-800">Multiple Awards</h5>
                                            <p className="text-gray-600 text-sm">Recognized for excellence in education</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                        <i className="fa-solid fa-users text-blue-600 text-xl mr-4"></i>
                                        <div>
                                            <h5 className="font-semibold text-gray-800">1000+ Students</h5>
                                            <p className="text-gray-600 text-sm">Successfully educated students</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                                        <i className="fa-solid fa-star text-green-600 text-xl mr-4"></i>
                                        <div>
                                            <h5 className="font-semibold text-gray-800">High Satisfaction</h5>
                                            <p className="text-gray-600 text-sm">95% student satisfaction rate</p>
                                        </div>
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
                        Join Our <span className="text-yellow-300">Educational</span> Journey
                    </h2>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
                        Be part of an institution that values excellence, innovation, and student success.
                        Start your educational journey with us today.
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

export default AboutUsPage
