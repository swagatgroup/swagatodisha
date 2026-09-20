import {
    RiBankFill,
    RiEarthFill,
    RiGraduationCapFill,
    RiGroupFill,
    RiLightbulbFlashFill
} from '@remixicon/react';

const AboutUs = () => {
    const [isVisible, setIsVisible] = useState(false)
    const aboutRef = useRef(null)

    const features = [
        {
            icon: RiGraduationCapFill,
            title: "Academic Excellence",
            description: "Comprehensive curriculum designed for modern learning needs",
            color: "from-[#4A1D7A] to-[#351458]" // Primary Brand
        },
        {
            icon: RiLightbulbFlashFill,
            title: "Innovation Hub",
            description: "Cutting-edge facilities fostering creativity and research",
            color: "from-[#E8A817] to-[#C98B05]" // Accent Gold
        },
        {
            icon: RiGroupFill,
            title: "Community Focus",
            description: "Building strong relationships with students and families",
            color: "from-[#1D4B5E] to-[#133A4A]" // Teal Brand
        },
        {
            icon: RiEarthFill,
            title: "Global Perspective",
            description: "International partnerships and opportunities",
            color: "from-[#4A1D7A] to-[#1D4B5E]" // Primary to Teal
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

    return (
        <section
            ref={aboutRef}
            id="about-us"
            className="relative py-20 bg-gray-50/50 dark:bg-[#1A1212]/50"
        >
            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4A1D7A] rounded-2xl mb-6 shadow-brand">
                        <RiBankFill className="text-white w-8 h-8" />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        About <span className="text-[#4A1D7A] dark:text-[#9B6FCC]">Us</span>
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Discover the story behind our commitment to educational excellence and innovation
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left Side - About Content */}
                        <div className={`space-y-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                    {APP_CONFIG.name}
                                </h3>
                                <div className="space-y-4 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                    <p>
                                        Swagat Group of Institutions is a premier educational organization committed to providing
                                        quality education and fostering innovation in the field of learning. Our journey began with
                                        a vision to revolutionize education and create opportunities for students to excel in their chosen fields.
                                    </p>
                                    <p>
                                        We believe in the power of education to transform lives and communities. Our comprehensive
                                        range of institutions covers every aspect of learning, from primary education to higher studies,
                                        ensuring that students receive the best possible foundation for their future.
                                    </p>
                                </div>
                            </div>

                            {/* Interactive Stats */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-6 bg-white dark:bg-[#231A2E] rounded-2xl shadow-card border border-[#4A1D7A]/10 hover:-translate-y-1 transition-transform">
                                    <div className="text-3xl font-bold text-[#4A1D7A] dark:text-[#9B6FCC] mb-2">25+</div>
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Years of Excellence</div>
                                </div>
                                <div className="text-center p-6 bg-white dark:bg-[#231A2E] rounded-2xl shadow-card border border-[#1D4B5E]/10 hover:-translate-y-1 transition-transform">
                                    <div className="text-3xl font-bold text-[#1D4B5E] dark:text-[#5293AD] mb-2">50K+</div>
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Students Impacted</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Features Grid */}
                        <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="p-6 bg-white dark:bg-[#231A2E] rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 hover:-translate-y-1 hover:shadow-lg transition-all"
                                        >
                                            <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                                                <Icon className="text-white w-6 h-6" />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                {feature.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {feature.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Floating Achievement Badge */}
                            <div className="absolute -top-6 -right-6 md:-right-8 w-24 h-24 md:w-32 md:h-32 bg-[#E8A817] rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-[#231A2E] z-10">
                                <div className="text-center">
                                    <div className="text-xl md:text-2xl font-bold">100+</div>
                                    <div className="text-[10px] md:text-xs font-medium uppercase tracking-wider">Partners</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className={`text-center mt-16 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <button className="px-8 py-3.5 bg-[#4A1D7A] text-white rounded-pill font-bold text-sm shadow-brand hover:bg-[#351458] hover:-translate-y-0.5 transition-all">
                        Discover More
                    </button>
                </div>
            </div>
        </section>
    )
}

export default AboutUs
