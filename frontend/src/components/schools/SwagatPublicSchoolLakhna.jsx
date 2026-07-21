import React from 'react'
import SchoolPageTemplate from './SchoolPageTemplate'

const SwagatPublicSchoolLakhna = () => {
    const schoolData = {
        schoolName: "Swagat Public School",
        location: "Lakhna, Nuapada, Odisha",
        description: "A progressive educational institution in the heart of Nuapada district, providing comprehensive CBSE education with a focus on holistic development and community empowerment. We are dedicated to nurturing future leaders through quality education and character building.",

        features: [
            {
                icon: "🌍",
                title: "Holistic Development",
                description: "Comprehensive approach to education focusing on academic excellence, character building, and life skills development."
            },
            {
                icon: "👨‍🏫",
                title: "Expert Faculty",
                description: "Highly qualified and experienced teachers who are committed to student success and personal growth."
            },
            {
                icon: "📚",
                title: "Modern Curriculum",
                description: "Complete CBSE curriculum from Class 1 to 10, integrated with modern teaching methodologies and technology."
            },
            {
                icon: "🎯",
                title: "Goal-Oriented Learning",
                description: "Focus on setting and achieving academic and personal goals, preparing students for future challenges."
            },
            {
                icon: "🤝",
                title: "Community Partnership",
                description: "Strong collaboration with local community, parents, and organizations for comprehensive student support."
            },
            {
                icon: "💡",
                title: "Innovation Focus",
                description: "Encouraging creative thinking, problem-solving, and innovative approaches to learning and development."
            }
        ],

        programs: [
            {
                icon: "🌱",
                name: "Primary Education (Class 1-5)",
                description: "Foundation years focusing on basic literacy, numeracy, and social skills with creative learning approaches.",
                subjects: ["English", "Hindi", "Mathematics", "Environmental Studies", "Art & Craft", "Physical Education"]
            },
            {
                icon: "📖",
                name: "Middle School (Class 6-8)",
                description: "Comprehensive curriculum with emphasis on critical thinking, problem-solving, and practical applications.",
                subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Science"]
            },
            {
                icon: "🎯",
                name: "Secondary (Class 9-10)",
                description: "CBSE curriculum with intensive preparation for board examinations and career guidance.",
                subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Applications"]
            }
        ],

        facilities: [
            {
                icon: "🏫",
                name: "Modern Classrooms",
                description: "Well-equipped classrooms with modern teaching aids and comfortable learning environment."
            },
            {
                icon: "💻",
                name: "Computer Laboratory",
                description: "State-of-the-art computer lab with high-speed internet and educational software."
            },
            {
                icon: "🔬",
                name: "Science Laboratories",
                description: "Well-equipped physics, chemistry, and biology labs for practical learning and experiments."
            },
            {
                icon: "📚",
                name: "Digital Library",
                description: "Comprehensive library with books, e-books, and digital learning resources."
            },
            {
                icon: "🏃",
                name: "Sports Complex",
                description: "Multi-purpose sports facility with equipment for various indoor and outdoor games."
            },
            {
                icon: "🎭",
                name: "Cultural Hall",
                description: "Spacious hall for cultural events, assemblies, and community gatherings."
            },
            {
                icon: "🍎",
                name: "Health Center",
                description: "Well-equipped medical room with qualified healthcare professionals."
            },
            {
                icon: "🚌",
                name: "Transport Network",
                description: "Comprehensive bus service covering nearby villages and areas."
            }
        ],

        achievements: [
            {
                icon: "🏆",
                title: "Academic Excellence",
                description: "Consistently achieving excellent results in CBSE board examinations with many students scoring above 85%."
            },
            {
                icon: "🌟",
                title: "Regional Leadership",
                description: "Recognized as a leading educational institution in the Nuapada district."
            },
            {
                icon: "🎓",
                title: "Student Success",
                description: "Students have successfully pursued higher education in reputed institutions across India."
            },
            {
                icon: "🏅",
                title: "Sports Achievements",
                description: "Students have represented the district in various state-level sports competitions."
            },
            {
                icon: "📈",
                title: "Infrastructure Development",
                description: "Continuous improvement in school infrastructure and learning facilities."
            },
            {
                icon: "🎖️",
                title: "Teacher Recognition",
                description: "Several teachers have received recognition for their innovative teaching methods."
            }
        ],

        contactInfo: [
            {
                icon: "📍",
                title: "Address",
                value: "Swagat Public School, Lakhna, Nuapada, Odisha - 766108"
            },
            {
                icon: "📞",
                title: "Call Us",
                value: "+91 7855959544"
            },
            {
                icon: "✉️",
                title: "Email Us",
                value: "contact@swagatodisha.com"
            }
        ],

        seoData: {
            title: "Swagat Public School Lakhna Nuapada - Leading CBSE School in Odisha | Admissions 2024",
            description: "Swagat Public School Lakhna offers comprehensive CBSE education in Nuapada with modern facilities, experienced faculty, and focus on holistic development. Admissions open for 2024-25.",
            keywords: "Swagat Public School Lakhna, CBSE school Nuapada, school admissions 2024, best school Nuapada, education Lakhna, CBSE curriculum, holistic development",
            url: "https://swagatodisha.com/SwagatPublicSchool_Lakhna",
            image: "https://swagatodisha.com/Swagat_Logo.png",
            structuredData: {
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                "name": "Swagat Public School",
                "alternateName": "Swagat Public School Lakhna",
                "description": "A premier CBSE educational institution in Lakhna, Nuapada, Odisha, providing comprehensive education with focus on holistic development and modern facilities.",
                "url": "https://swagatodisha.com/SwagatPublicSchool_Lakhna",
                "logo": "https://swagatodisha.com/Swagat_Logo.png",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Swagat Public School",
                    "addressLocality": "Lakhna, Nuapada",
                    "addressRegion": "Odisha",
                    "postalCode": "766108",
                    "addressCountry": "IN"
                },
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91 7855959544",
                    "contactType": "Admissions",
                    "email": "contact@swagatodisha.com"
                },
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Educational Programs",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Course",
                                "name": "Primary Education",
                                "description": "Foundation years focusing on basic literacy and creative learning"
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Course",
                                "name": "Secondary Education",
                                "description": "CBSE curriculum with focus on holistic development and career preparation"
                            }
                        }
                    ]
                },
                "sameAs": [
                    "https://swagatodisha.com"
                ]
            }
        }
    }

    return <SchoolPageTemplate {...schoolData} />
}

export default SwagatPublicSchoolLakhna
