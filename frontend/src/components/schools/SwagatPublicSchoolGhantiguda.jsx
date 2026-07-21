import React from 'react'
import SchoolPageTemplate from './SchoolPageTemplate'

const SwagatPublicSchoolGhantiguda = () => {
    const schoolData = {
        schoolName: "Swagat Public School",
        location: "Ghantiguda, Sinapali, Odisha",
        description: "A nurturing educational institution in the heart of rural Odisha, providing quality CBSE education with modern facilities and dedicated faculty. We are committed to empowering students from rural communities with excellent education and holistic development.",

        features: [
            {
                icon: "🌾",
                title: "Rural Education Excellence",
                description: "Dedicated to providing quality education in rural areas, bridging the urban-rural education gap with modern teaching methods."
            },
            {
                icon: "👨‍🏫",
                title: "Experienced Faculty",
                description: "Qualified and experienced teachers who understand the unique needs of rural students and provide personalized attention."
            },
            {
                icon: "📚",
                title: "CBSE Curriculum",
                description: "Complete CBSE curriculum from Class 1 to 10, ensuring students receive nationally recognized education."
            },
            {
                icon: "🏫",
                title: "Modern Infrastructure",
                description: "Well-equipped classrooms, laboratories, and facilities despite being in a rural setting."
            },
            {
                icon: "🤝",
                title: "Community Focus",
                description: "Strong community engagement and support, working closely with local families and organizations."
            },
            {
                icon: "💡",
                title: "Holistic Development",
                description: "Focus on overall personality development, character building, and life skills alongside academics."
            }
        ],

        programs: [
            {
                icon: "👶",
                name: "Primary Education (Class 1-5)",
                description: "Foundation years focusing on basic literacy, numeracy, and social skills development.",
                subjects: ["English", "Hindi", "Mathematics", "Environmental Studies", "Art & Craft", "Physical Education"]
            },
            {
                icon: "🎒",
                name: "Middle School (Class 6-8)",
                description: "Comprehensive curriculum with emphasis on critical thinking and practical learning.",
                subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Science"]
            },
            {
                icon: "🎯",
                name: "Secondary (Class 9-10)",
                description: "CBSE curriculum with focus on board examination preparation and career guidance.",
                subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Computer Applications"]
            }
        ],

        facilities: [
            {
                icon: "🏫",
                name: "Modern Classrooms",
                description: "Well-ventilated, spacious classrooms with comfortable seating and learning aids."
            },
            {
                icon: "💻",
                name: "Computer Lab",
                description: "Fully equipped computer laboratory with internet connectivity for digital learning."
            },
            {
                icon: "🔬",
                name: "Science Lab",
                description: "Well-equipped science laboratory for practical learning and experiments."
            },
            {
                icon: "📚",
                name: "Library",
                description: "Extensive library with books, reference materials, and reading space."
            },
            {
                icon: "🏃",
                name: "Playground",
                description: "Spacious playground for sports and physical activities."
            },
            {
                icon: "🍽️",
                name: "Cafeteria",
                description: "Clean and hygienic cafeteria serving nutritious meals."
            },
            {
                icon: "🚌",
                name: "Transport",
                description: "School bus service covering nearby villages and areas."
            },
            {
                icon: "🏥",
                name: "Health Center",
                description: "Basic medical facilities and regular health check-ups."
            }
        ],

        achievements: [
            {
                icon: "🏆",
                title: "Academic Excellence",
                description: "Consistent good results in CBSE board examinations with many students scoring above 80%."
            },
            {
                icon: "🌟",
                title: "Rural Education Impact",
                description: "Significant contribution to improving education standards in rural Odisha."
            },
            {
                icon: "🎓",
                title: "Student Success",
                description: "Many students have successfully pursued higher education in reputed institutions."
            },
            {
                icon: "🤝",
                title: "Community Recognition",
                description: "Highly regarded by local community for quality education and student welfare."
            },
            {
                icon: "📈",
                title: "Growth & Development",
                description: "Continuous improvement in infrastructure and educational facilities."
            },
            {
                icon: "🏅",
                title: "Teacher Excellence",
                description: "Dedicated teachers recognized for their commitment to rural education."
            }
        ],

        contactInfo: [
            {
                icon: "📍",
                title: "Address",
                value: "Swagat Public School, Ghantiguda, Sinapali, Odisha - 766108"
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
            title: "Swagat Public School Ghantiguda Sinapali - Best CBSE School in Rural Odisha | Admissions Open 2024",
            description: "Swagat Public School Ghantiguda offers quality CBSE education in rural Odisha with modern facilities, experienced faculty, and community focus. Admissions open for 2024-25 session.",
            keywords: "Swagat Public School Ghantiguda, CBSE school Sinapali, rural school Odisha, school admissions 2024, best school Nuapada, education Ghantiguda, CBSE curriculum",
            url: "https://swagatodisha.com/SwagatPublicSchool_Ghantiguda",
            image: "https://swagatodisha.com/Swagat_Logo.png",
            structuredData: {
                "@context": "https://schema.org",
                "@type": "EducationalOrganization",
                "name": "Swagat Public School",
                "alternateName": "Swagat Public School Ghantiguda",
                "description": "A premier CBSE educational institution in Ghantiguda, Sinapali, Odisha, providing quality education in rural areas with modern facilities and community focus.",
                "url": "https://swagatodisha.com/SwagatPublicSchool_Ghantiguda",
                "logo": "https://swagatodisha.com/Swagat_Logo.png",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Swagat Public School",
                    "addressLocality": "Ghantiguda, Sinapali",
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
                                "description": "Foundation years focusing on basic literacy and numeracy"
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

export default SwagatPublicSchoolGhantiguda
