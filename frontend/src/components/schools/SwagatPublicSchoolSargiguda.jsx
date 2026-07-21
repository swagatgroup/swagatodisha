import React from 'react'
import SchoolPageTemplate from './SchoolPageTemplate'

const SwagatPublicSchoolSargiguda = () => {
    const schoolData = {
        schoolName: "Swagat Public School",
        location: "Sargiguda, Kantabanji, Odisha",
        description: "A dedicated educational institution serving the community of Kantabanji, providing comprehensive CBSE education with a focus on student development and community engagement. We are committed to nurturing young minds in a supportive and encouraging environment.",

        features: [
            {
                icon: "🏛️",
                title: "Community-Centered Education",
                description: "Deeply rooted in the local community, providing education that respects and incorporates local values and culture."
            },
            {
                icon: "👩‍🏫",
                title: "Qualified Teachers",
                description: "Experienced and qualified faculty members who are passionate about teaching and student development."
            },
            {
                icon: "📖",
                title: "Comprehensive Curriculum",
                description: "Complete CBSE curriculum from Class 1 to 10, ensuring students receive quality education at par with urban schools."
            },
            {
                icon: "🎨",
                title: "Cultural Integration",
                description: "Integration of local culture and traditions with modern education, creating a unique learning experience."
            },
            {
                icon: "🤝",
                title: "Parent Partnership",
                description: "Strong collaboration with parents and guardians to ensure holistic development of every child."
            },
            {
                icon: "💪",
                title: "Character Building",
                description: "Focus on moral values, discipline, and character development alongside academic excellence."
            }
        ],

        programs: [
            {
                icon: "🌱",
                name: "Primary Education (Class 1-5)",
                description: "Foundation years focusing on basic skills, creativity, and social development.",
                subjects: ["English", "Hindi", "Mathematics", "Environmental Studies", "Art & Craft", "Music"]
            },
            {
                icon: "📚",
                name: "Middle School (Class 6-8)",
                description: "Comprehensive curriculum with emphasis on analytical thinking and practical applications.",
                subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Science"]
            },
            {
                icon: "🎯",
                name: "Secondary (Class 9-10)",
                description: "CBSE curriculum with intensive preparation for board examinations and future studies.",
                subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Applications"]
            }
        ],

        facilities: [
            {
                icon: "🏫",
                name: "Spacious Classrooms",
                description: "Well-designed classrooms with proper ventilation and comfortable learning environment."
            },
            {
                icon: "💻",
                name: "Computer Laboratory",
                description: "Modern computer lab with internet connectivity and educational software."
            },
            {
                icon: "🔬",
                name: "Science Laboratory",
                description: "Well-equipped science lab for hands-on learning and experiments."
            },
            {
                icon: "📖",
                name: "Resource Library",
                description: "Comprehensive library with books, journals, and digital learning resources."
            },
            {
                icon: "🏃",
                name: "Sports Facilities",
                description: "Playground and sports equipment for physical education and recreation."
            },
            {
                icon: "🎭",
                name: "Cultural Center",
                description: "Space for cultural activities, drama, and community events."
            },
            {
                icon: "🍎",
                name: "Health Services",
                description: "Basic medical facilities and regular health monitoring for students."
            },
            {
                icon: "🚌",
                name: "Transportation",
                description: "School bus service for safe and convenient transportation."
            }
        ],

        achievements: [
            {
                icon: "🏆",
                title: "Academic Success",
                description: "Consistent good performance in CBSE board examinations with improving results year by year."
            },
            {
                icon: "🌟",
                title: "Community Impact",
                description: "Significant positive impact on education standards in the Kantabanji region."
            },
            {
                icon: "🎓",
                title: "Student Achievements",
                description: "Students have successfully pursued higher education and professional careers."
            },
            {
                icon: "🤝",
                title: "Community Recognition",
                description: "Highly appreciated by local community for quality education and student care."
            },
            {
                icon: "📈",
                title: "Infrastructure Growth",
                description: "Continuous improvement in school infrastructure and learning facilities."
            },
            {
                icon: "🏅",
                title: "Teacher Dedication",
                description: "Teachers recognized for their dedication and innovative teaching methods."
            }
        ],

        contactInfo: [
            {
                icon: "📍",
                title: "Address",
                value: "Swagat Public School, Sargiguda, Kantabanji, Odisha - 767039"
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
            title: "Swagat Public School Sargiguda Kantabanji - Premier CBSE School in Balangir | Admissions 2024",
            description: "Swagat Public School Sargiguda offers quality CBSE education in Kantabanji, Balangir with community focus, modern facilities, and experienced faculty. Admissions open for 2024-25.",
            keywords: "Swagat Public School Sargiguda, CBSE school Kantabanji, school Balangir, education Sargiguda, school admissions 2024, best school Balangir, CBSE curriculum",
            url: "https://swagatodisha.com/SwagatPublicSchool_Sargiguda",
            image: "https://swagatodisha.com/Swagat_Logo.png",
            structuredData: {
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                "name": "Swagat Public School",
                "alternateName": "Swagat Public School Sargiguda",
                "description": "A premier CBSE educational institution in Sargiguda, Kantabanji, Odisha, providing quality education with community focus and modern facilities.",
                "url": "https://swagatodisha.com/SwagatPublicSchool_Sargiguda",
                "logo": "https://swagatodisha.com/Swagat_Logo.png",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Swagat Public School",
                    "addressLocality": "Sargiguda, Kantabanji",
                    "addressRegion": "Odisha",
                    "postalCode": "767039",
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
                                "description": "Foundation years focusing on basic skills and creativity"
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Course",
                                "name": "Secondary Education",
                                "description": "CBSE curriculum with focus on board examination preparation"
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

export default SwagatPublicSchoolSargiguda
