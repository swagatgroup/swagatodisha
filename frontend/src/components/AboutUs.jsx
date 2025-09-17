import {useState, useEffect, useRef} from 'react';
import { APP_CONFIG } from '../utils/constants'
import CloudWave from './CloudWave'

const AboutUs = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [activeFeature, setActiveFeature] = useState(0)
    const aboutRef = useRef(null)

    const features = [
        {
            icon: "fa-solid fa-graduation-cap",
            title: "Academic Excellence",
            description: "Comprehensive curriculum designed for modern learning needs",
            color: "from-purple-500 to-purple-600"
        },
        {
            icon: "fa-solid fa-lightbulb",
            title: "Innovation Hub",
            description: "Cutting-edge facilities fostering creativity and research",
            color: "from-blue-500 to-blue-600"
        },
        {
            icon: "fa-solid fa-users",
            title: "Community Focus",
            description: "Building strong relationships with students and families",
            color: "from-green-500 to-green-600"
        },
        {
            icon: "fa-solid fa-globe",
            title: "Global Perspective",
            description: "International partnerships and opportunities",
            color: "from-orange-500 to-orange-600"
        }
    ]

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (aboutRef.current) {
            observer.observe(aboutRef.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [features.length])

    return (
        <section
            ref={aboutRef}
            id="about-us"
            className="relative py-20"
        >
            {/* Parallax Background Elements */}
            <div className="absolute inset-0">
                <div className={`absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full blur-3xl transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}></div>
                <div className={`absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}></div>

                {/* Floating geometric shapes */}
                <div className={`absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-lg blur-xl transition-all duration-1000 delay-500 ${isVisible ? 'animate-float-slow opacity-100' : 'opacity-0'
                    }`}></div>
                <div className={`absolute bottom-1/3 left-1/4 w-20 h-20 bg-gradient-to-r from-blue-400/30 to-green-400/30 rounded-full blur-xl transition-all duration-1000 delay-700 ${isVisible ? 'animate-float-medium opacity-100' : 'opacity-0'
                    }`}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl transition-all duration-1000 delay-300 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                        }`}>
                        <i className="fa-solid fa-university text-white text-3xl"></i>
                    </div>

                    <h2 className={`text-5xl md:text-7xl font-bold text-gray-800 mb-6 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}>
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Us</span>
                    </h2>

                    <p className={`text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}>
                        Discover the story behind our commitment to educational excellence and innovation
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left Side - About Content */}
                        <div className={`space-y-8 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                            }`}>
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
                            </div>

                            {/* Interactive Stats */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className={`text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-700 delay-1100 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    }`}>
                                    <div className="text-3xl font-bold text-purple-600 mb-2">25+</div>
                                    <div className="text-sm text-gray-600">Years of Excellence</div>
                                </div>
                                <div className={`text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-700 delay-1300 hover:scale-105 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    }`}>
                                    <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                                    <div className="text-sm text-gray-600">Students Impacted</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Interactive Features */}
                        <div className={`relative transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                            }`}>
                            <div className="grid grid-cols-2 gap-6">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className={`relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl ${activeFeature === index ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                                            }`}
                                        onMouseEnter={() => setActiveFeature(index)}
                                    >
                                        {/* Background Pattern */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>

                                        {/* Icon */}
                                        <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 ${activeFeature === index ? 'animate-pulse-slow' : ''
                                            }`}>
                                            <i className={`${feature.icon} text-white text-2xl`}></i>
                                        </div>

                                        {/* Content */}
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                                            {feature.title}
                                        </h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>

                                        {/* Hover Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating Achievement Badge */}
                            <div className={`absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-1000 delay-1500 ${isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-180'
                                }`}>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">100+</div>
                                    <div className="text-xs">Partnerships</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className={`text-center mt-20 transition-all duration-1000 delay-1700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}>
                    <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                        <span className="relative z-10">Discover More</span>

                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </button>
                </div>
            </div>

            {/* Cloud Wave Bottom Element */}
            <CloudWave />
        </section>
    )
}

export default AboutUs
