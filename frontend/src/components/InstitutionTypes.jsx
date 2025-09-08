import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const InstitutionTypes = () => {
    const navigate = useNavigate()
    const [selectedInstitution, setSelectedInstitution] = useState(null)
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubModalOpen, setIsSubModalOpen] = useState(false)
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)

    // Debug useEffect to monitor state changes
    useEffect(() => {
        console.log('🔄 State changed - isModalOpen:', isModalOpen)
        console.log('🔄 State changed - selectedInstitution:', selectedInstitution?.name)
        console.log('🔄 State changed - isSubModalOpen:', isSubModalOpen)
        console.log('🔄 State changed - selectedProgram:', selectedProgram?.name)
        console.log('🔄 State changed - isCourseModalOpen:', isCourseModalOpen)
        console.log('🔄 State changed - selectedCourse:', selectedCourse?.name)
    }, [isModalOpen, selectedInstitution, isSubModalOpen, selectedProgram, isCourseModalOpen, selectedCourse])

    const institutions = [
        {
            id: "school",
            name: "School",
            subtitle: "Primary & Secondary Education",
            description: "Comprehensive education from primary to secondary levels with modern teaching methodologies and holistic development focus across multiple campuses.",
            icon: "fa-solid fa-school",
            iconBg: "from-green-500 to-emerald-600",
            color: "green",
            programs: [
                {
                    name: "Swagat Public School, Ghantiguda, Sinapali",
                    type: "Primary & Secondary",
                    details: "Complete school education from Class 1 to 10 with CBSE curriculum in a modern learning environment",
                    feeStructure: {
                        admissionFee: "₹5,000",
                        monthlyFee: "₹1,500",
                        annualFee: "₹2,000",
                        otherCharges: "₹1,000"
                    },
                    hasWebsite: true,
                    websiteUrl: "/SwagatPublicSchool_Ghantiguda"
                },
                {
                    name: "Swagat Public School, Sargiguda, Kantabanji",
                    type: "Primary & Secondary",
                    details: "Complete school education from Class 1 to 10 with CBSE curriculum in a nurturing environment",
                    feeStructure: {
                        admissionFee: "₹5,000",
                        monthlyFee: "₹1,500",
                        annualFee: "₹2,000",
                        otherCharges: "₹1,000"
                    },
                    hasWebsite: true,
                    websiteUrl: "/SwagatPublicSchool_Sargiguda"
                },
                {
                    name: "Swagat Public School, Lakhna, Nuapada",
                    type: "Primary & Secondary",
                    details: "Complete school education from Class 1 to 10 with CBSE curriculum with focus on holistic development",
                    feeStructure: {
                        admissionFee: "₹5,000",
                        monthlyFee: "₹1,500",
                        annualFee: "₹2,000",
                        otherCharges: "₹1,000"
                    },
                    hasWebsite: true,
                    websiteUrl: "/SwagatPublicSchool_Lakhna"
                }
            ]
        },
        {
            id: "higher-secondary",
            name: "Higher Secondary School",
            subtitle: "Advanced Secondary Education",
            description: "Specialized higher secondary education with focus on academic excellence and career preparation through multiple recognized boards.",
            icon: "fa-solid fa-graduation-cap",
            iconBg: "from-blue-500 to-cyan-600",
            color: "blue",
            programs: [
                {
                    name: "NIOS (National Institute of Open Schooling)",
                    type: "10th, +2 Arts, Science, Commerce",
                    details: "Flexible learning with recognized qualifications for 10th and 12th standard",
                    feeStructure: {
                        registrationFee: "₹200",
                        courseFee: "₹1,500",
                        examinationFee: "₹500",
                        totalFee: "₹2,200"
                    }
                },
                {
                    name: "BOSSE (Board of Open Schooling and Skill Education)",
                    type: "10th, +2 Arts, Science, Commerce",
                    details: "Alternative education board offering flexible learning options",
                    feeStructure: {
                        registrationFee: "₹300",
                        courseFee: "₹1,800",
                        examinationFee: "₹600",
                        totalFee: "₹2,700"
                    }
                },
                {
                    name: "OSBME (Odisha State Board of Madrasa Education)",
                    type: "10th, +2 Arts, Commerce",
                    details: "State-recognized board for Islamic education and general subjects",
                    feeStructure: {
                        registrationFee: "₹250",
                        courseFee: "₹1,600",
                        examinationFee: "₹550",
                        totalFee: "₹2,400"
                    }
                }
            ]
        },
        {
            id: "degree-college",
            name: "Degree College",
            subtitle: "Undergraduate & Postgraduate Programs",
            description: "Comprehensive degree programs across various disciplines with industry-aligned curriculum and expert faculty.",
            icon: "fa-solid fa-university",
            iconBg: "from-purple-500 to-indigo-600",
            color: "purple",
            programs: [
                {
                    name: "Bachelors Degree Programs",
                    type: "Undergraduate Programs",
                    details: "Three-year comprehensive undergraduate programs across multiple disciplines",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "B.A. (Bachelor of Arts)",
                            duration: "3 Years",
                            details: "Comprehensive arts program with specializations in History, Political Science, Economics, Sociology, and Literature",
                            feeStructure: {
                                admissionFee: "₹3,000",
                                semesterFee: "₹7,500",
                                annualFee: "₹14,000",
                                examinationFee: "₹1,500",
                                totalProgramFee: "₹49,000"
                            }
                        },
                        {
                            name: "B.Sc. (Bachelor of Science)",
                            duration: "3 Years",
                            details: "Science programs in Physics, Chemistry, Mathematics, Biology, and Computer Science",
                            feeStructure: {
                                admissionFee: "₹3,000",
                                semesterFee: "₹8,500",
                                annualFee: "₹16,000",
                                laboratoryFee: "₹2,000",
                                examinationFee: "₹1,500",
                                totalProgramFee: "₹58,000"
                            }
                        },
                        {
                            name: "B.Com. (Bachelor of Commerce)",
                            duration: "3 Years",
                            details: "Commerce program with accounting, finance, and business management focus",
                            feeStructure: {
                                admissionFee: "₹3,000",
                                semesterFee: "₹8,000",
                                annualFee: "₹15,000",
                                examinationFee: "₹1,500",
                                totalProgramFee: "₹52,500"
                            }
                        },
                        {
                            name: "B.S.W. (Bachelor of Social Work)",
                            duration: "3 Years",
                            details: "Social work program with community development and social welfare focus",
                            feeStructure: {
                                admissionFee: "₹3,000",
                                semesterFee: "₹7,800",
                                annualFee: "₹14,500",
                                fieldFee: "₹2,000",
                                examinationFee: "₹1,500",
                                totalProgramFee: "₹53,800"
                            }
                        },
                        {
                            name: "B.Libs (Bachelor of Library Science)",
                            duration: "3 Years",
                            details: "Library science program with information management and digital library systems",
                            feeStructure: {
                                admissionFee: "₹3,000",
                                semesterFee: "₹7,200",
                                annualFee: "₹13,500",
                                practicalFee: "₹1,800",
                                examinationFee: "₹1,500",
                                totalProgramFee: "₹48,000"
                            }
                        }
                    ]
                },
                {
                    name: "Masters Degree Programs",
                    type: "Postgraduate Programs",
                    details: "Two-year advanced postgraduate programs with research and specialization options",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "M.A. (Master of Arts)",
                            duration: "2 Years",
                            details: "Advanced studies in Arts with research methodology and specialized electives",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹11,000",
                                annualFee: "₹20,000",
                                researchFee: "₹3,000",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹61,000"
                            }
                        },
                        {
                            name: "M.Sc. (Master of Science)",
                            duration: "2 Years",
                            details: "Advanced science programs with laboratory research and thesis work",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹12,500",
                                annualFee: "₹23,000",
                                laboratoryFee: "₹3,500",
                                researchFee: "₹4,000",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹70,000"
                            }
                        },
                        {
                            name: "M.Com. (Master of Commerce)",
                            duration: "2 Years",
                            details: "Advanced commerce with financial analysis and business research",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹12,000",
                                annualFee: "₹22,000",
                                researchFee: "₹3,500",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹67,500"
                            }
                        },
                        {
                            name: "M.S.W. (Master of Social Work)",
                            duration: "2 Years",
                            details: "Advanced social work with community development and policy research",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹11,500",
                                annualFee: "₹21,000",
                                fieldFee: "₹3,000",
                                researchFee: "₹3,500",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹66,000"
                            }
                        },
                        {
                            name: "M.Libs (Master of Library Science)",
                            duration: "2 Years",
                            details: "Advanced library science with digital information systems and research",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹11,200",
                                annualFee: "₹20,500",
                                practicalFee: "₹2,500",
                                researchFee: "₹3,000",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹64,200"
                            }
                        }
                    ]
                }
            ]
        },
        {
            id: "management-school",
            name: "Management School",
            subtitle: "Business & Management Education",
            description: "Professional management education with practical business insights and leadership development programs.",
            icon: "fa-solid fa-briefcase",
            iconBg: "from-orange-500 to-red-600",
            color: "orange",
            programs: [
                {
                    name: "Undergraduate Programs",
                    type: "BBA & Related Degrees",
                    details: "Comprehensive business administration programs with modern curriculum and industry exposure",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "B.B.A. (Bachelor of Business Administration)",
                            duration: "3 Years",
                            details: "Comprehensive business administration program covering all aspects of modern business",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,000",
                                annualFee: "₹28,000",
                                examinationFee: "₹2,500",
                                totalProgramFee: "₹1,26,000"
                            }
                        },
                        {
                            name: "B.B.A. in Finance",
                            duration: "3 Years",
                            details: "Specialized BBA program focusing on financial management and banking",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹16,000",
                                annualFee: "₹30,000",
                                examinationFee: "₹2,500",
                                totalProgramFee: "₹1,32,000"
                            }
                        },
                        {
                            name: "B.B.A. in Marketing",
                            duration: "3 Years",
                            details: "BBA program specializing in marketing strategies and digital marketing",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,500",
                                annualFee: "₹29,000",
                                examinationFee: "₹2,500",
                                totalProgramFee: "₹1,29,000"
                            }
                        },
                        {
                            name: "B.B.A. in Human Resources",
                            duration: "3 Years",
                            details: "BBA program focusing on HR management and organizational behavior",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,200",
                                annualFee: "₹28,500",
                                examinationFee: "₹2,500",
                                totalProgramFee: "₹1,27,200"
                            }
                        },
                        {
                            name: "B.B.A. in International Business",
                            duration: "3 Years",
                            details: "BBA program with global business perspective and international trade focus",
                            feeStructure: {
                                admissionFee: "₹6,000",
                                semesterFee: "₹17,000",
                                annualFee: "₹31,000",
                                examinationFee: "₹2,800",
                                totalProgramFee: "₹1,38,800"
                            }
                        }
                    ]
                },
                {
                    name: "Postgraduate Programs",
                    type: "MBA & Advanced Management",
                    details: "Advanced management programs with specialization options and industry partnerships",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "M.B.A. (Master of Business Administration)",
                            duration: "2 Years",
                            details: "Advanced business management with specialization options",
                            feeStructure: {
                                admissionFee: "₹8,000",
                                semesterFee: "₹25,000",
                                annualFee: "₹45,000",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹1,81,500"
                            }
                        },
                        {
                            name: "M.B.A. in Finance",
                            duration: "2 Years",
                            details: "MBA specializing in financial management, investment banking, and corporate finance",
                            feeStructure: {
                                admissionFee: "₹8,000",
                                semesterFee: "₹26,000",
                                annualFee: "₹47,000",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹1,87,500"
                            }
                        },
                        {
                            name: "M.B.A. in Marketing",
                            duration: "2 Years",
                            details: "MBA focusing on digital marketing, brand management, and market research",
                            feeStructure: {
                                admissionFee: "₹8,000",
                                semesterFee: "₹25,500",
                                annualFee: "₹46,000",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹1,84,000"
                            }
                        },
                        {
                            name: "M.B.A. in Human Resources",
                            duration: "2 Years",
                            details: "MBA specializing in HR strategy, talent management, and organizational development",
                            feeStructure: {
                                admissionFee: "₹8,000",
                                semesterFee: "₹24,500",
                                annualFee: "₹44,000",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹1,79,000"
                            }
                        },
                        {
                            name: "M.B.A. in Operations Management",
                            duration: "2 Years",
                            details: "MBA focusing on supply chain management, quality control, and process optimization",
                            feeStructure: {
                                admissionFee: "₹8,000",
                                semesterFee: "₹25,200",
                                annualFee: "₹45,500",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹1,82,200"
                            }
                        },
                        {
                            name: "M.B.A. in Information Technology",
                            duration: "2 Years",
                            details: "MBA combining business management with IT strategy and digital transformation",
                            feeStructure: {
                                admissionFee: "₹9,000",
                                semesterFee: "₹27,000",
                                annualFee: "₹49,000",
                                examinationFee: "₹3,800",
                                totalProgramFee: "₹1,93,800"
                            }
                        }
                    ]
                },
                {
                    name: "Specialized Management Programs",
                    type: "Finance & Control",
                    details: "Specialized programs in financial management and control systems",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "M.F.C. (Master of Finance and Control)",
                            duration: "2 Years",
                            details: "Specialized program in financial management and control systems",
                            feeStructure: {
                                admissionFee: "₹7,000",
                                semesterFee: "₹22,000",
                                annualFee: "₹40,000",
                                examinationFee: "₹3,000",
                                totalProgramFee: "₹1,62,000"
                            }
                        },
                        {
                            name: "P.G.D.F.M. (Post Graduate Diploma in Financial Management)",
                            duration: "1 Year",
                            details: "Intensive financial management program for working professionals",
                            feeStructure: {
                                admissionFee: "₹6,000",
                                programFee: "₹38,000",
                                examinationFee: "₹2,800",
                                totalProgramFee: "₹46,800"
                            }
                        },
                        {
                            name: "P.G.D.C.A. (Post Graduate Diploma in Computer Applications)",
                            duration: "1 Year",
                            details: "Computer applications program for business and management professionals",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                programFee: "₹32,000",
                                examinationFee: "₹2,500",
                                totalProgramFee: "₹39,500"
                            }
                        },
                        {
                            name: "P.M.I.R. (Post Graduate Diploma in Management)",
                            duration: "1 Year",
                            details: "Intensive management program for working professionals",
                            feeStructure: {
                                admissionFee: "₹6,000",
                                programFee: "₹35,000",
                                examinationFee: "₹2,500",
                                totalProgramFee: "₹43,500"
                            }
                        }
                    ]
                }
            ]
        },
        {
            id: "paramedical",
            name: "ParaMedical",
            subtitle: "Medical & Healthcare Training",
            description: "Professional healthcare training programs with practical experience and industry-standard certifications.",
            icon: "fa-solid fa-heart-pulse",
            iconBg: "from-pink-500 to-rose-600",
            color: "pink",
            programs: [
                {
                    name: "Medical Laboratory Technology",
                    type: "Diagnostic & Laboratory Programs",
                    details: "Comprehensive training in medical laboratory technology and diagnostic procedures",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "D.M.L.T. (Diploma in Medical Laboratory Technology)",
                            duration: "2 Years",
                            details: "Training in clinical laboratory procedures, blood analysis, and diagnostic testing",
                            feeStructure: {
                                admissionFee: "₹4,000",
                                semesterFee: "₹12,000",
                                annualFee: "₹22,000",
                                practicalFee: "₹3,000",
                                totalProgramFee: "₹65,000"
                            }
                        },
                        {
                            name: "D.M.R.T. (Diploma in Medical Radiology Technology)",
                            duration: "2 Years",
                            details: "Radiology technology training with X-ray, CT scan, and MRI procedures",
                            feeStructure: {
                                admissionFee: "₹4,500",
                                semesterFee: "₹13,000",
                                annualFee: "₹24,000",
                                practicalFee: "₹3,500",
                                totalProgramFee: "₹69,000"
                            }
                        },
                        {
                            name: "B.Sc. Medical Laboratory Technology",
                            duration: "3 Years",
                            details: "Bachelor degree in medical lab technology with advanced diagnostic techniques",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,000",
                                annualFee: "₹28,000",
                                practicalFee: "₹4,000",
                                totalProgramFee: "₹1,00,000"
                            }
                        },
                        {
                            name: "B.Sc. Medical Imaging Technology",
                            duration: "3 Years",
                            details: "Advanced imaging technology program covering all diagnostic modalities",
                            feeStructure: {
                                admissionFee: "₹5,500",
                                semesterFee: "₹16,000",
                                annualFee: "₹30,000",
                                practicalFee: "₹4,500",
                                totalProgramFee: "₹1,06,000"
                            }
                        }
                    ]
                },
                {
                    name: "Nursing Programs",
                    type: "Comprehensive Nursing Education",
                    details: "Complete nursing education pathway from auxiliary to degree level with clinical training",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "A.N.M. (Auxiliary Nurse Midwifery)",
                            duration: "2 Years",
                            details: "Basic nursing care and midwifery training for healthcare support",
                            feeStructure: {
                                admissionFee: "₹3,000",
                                semesterFee: "₹10,000",
                                annualFee: "₹18,000",
                                clinicalFee: "₹3,000",
                                totalProgramFee: "₹52,000"
                            }
                        },
                        {
                            name: "G.N.M. (General Nursing and Midwifery)",
                            duration: "3 Years",
                            details: "Comprehensive nursing program with midwifery and general nursing care",
                            feeStructure: {
                                admissionFee: "₹4,000",
                                semesterFee: "₹12,000",
                                annualFee: "₹22,000",
                                clinicalFee: "₹4,000",
                                totalProgramFee: "₹78,000"
                            }
                        },
                        {
                            name: "B.Sc. Nursing",
                            duration: "4 Years",
                            details: "Bachelor degree in nursing with advanced clinical practice and research",
                            feeStructure: {
                                admissionFee: "₹6,000",
                                semesterFee: "₹18,000",
                                annualFee: "₹32,000",
                                clinicalFee: "₹5,000",
                                totalProgramFee: "₹1,39,000"
                            }
                        },
                        {
                            name: "Post Basic B.Sc. Nursing",
                            duration: "2 Years",
                            details: "Post-basic nursing degree for GNM graduates with specialization options",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹16,000",
                                annualFee: "₹28,000",
                                clinicalFee: "₹4,500",
                                totalProgramFee: "₹89,500"
                            }
                        },
                        {
                            name: "M.Sc. Nursing",
                            duration: "2 Years",
                            details: "Master degree in nursing with advanced practice and research focus",
                            feeStructure: {
                                admissionFee: "₹7,000",
                                semesterFee: "₹20,000",
                                annualFee: "₹36,000",
                                researchFee: "₹5,000",
                                totalProgramFee: "₹1,48,000"
                            }
                        }
                    ]
                },
                {
                    name: "Allied Health Sciences",
                    type: "Specialized Healthcare Programs",
                    details: "Specialized healthcare programs in various allied health sciences with practical training",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "B.Sc. Operation Theatre Technology",
                            duration: "3 Years",
                            details: "Operation theatre management and surgical technology training",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,000",
                                annualFee: "₹28,000",
                                practicalFee: "₹4,000",
                                totalProgramFee: "₹1,00,000"
                            }
                        },
                        {
                            name: "B.Sc. Cardiac Care Technology",
                            duration: "3 Years",
                            details: "Cardiac care and cardiovascular technology with ECG and stress testing",
                            feeStructure: {
                                admissionFee: "₹5,500",
                                semesterFee: "₹16,000",
                                annualFee: "₹30,000",
                                practicalFee: "₹4,500",
                                totalProgramFee: "₹1,06,000"
                            }
                        },
                        {
                            name: "B.Sc. Respiratory Care Technology",
                            duration: "3 Years",
                            details: "Respiratory therapy and pulmonary function testing technology",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,500",
                                annualFee: "₹29,000",
                                practicalFee: "₹4,200",
                                totalProgramFee: "₹1,02,700"
                            }
                        },
                        {
                            name: "B.Sc. Dialysis Technology",
                            duration: "3 Years",
                            details: "Dialysis technology and renal care procedures",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,200",
                                annualFee: "₹28,500",
                                practicalFee: "₹4,100",
                                totalProgramFee: "₹1,01,800"
                            }
                        },
                        {
                            name: "B.Sc. Optometry",
                            duration: "3 Years",
                            details: "Optometry and vision care technology with clinical practice",
                            feeStructure: {
                                admissionFee: "₹5,500",
                                semesterFee: "₹16,500",
                                annualFee: "₹31,000",
                                practicalFee: "₹4,800",
                                totalProgramFee: "₹1,08,800"
                            }
                        },
                        {
                            name: "B.Sc. Physiotherapy",
                            duration: "4 Years",
                            details: "Physiotherapy and rehabilitation technology with clinical practice",
                            feeStructure: {
                                admissionFee: "₹6,000",
                                semesterFee: "₹18,000",
                                annualFee: "₹32,000",
                                practicalFee: "₹5,000",
                                totalProgramFee: "₹1,39,000"
                            }
                        }
                    ]
                },
                {
                    name: "Public Health Programs",
                    type: "Community Health & Epidemiology",
                    details: "Public health programs focusing on community health, epidemiology, and health administration",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "B.Sc. Public Health",
                            duration: "3 Years",
                            details: "Public health fundamentals with community health and epidemiology",
                            feeStructure: {
                                admissionFee: "₹4,000",
                                semesterFee: "₹12,000",
                                annualFee: "₹22,000",
                                fieldFee: "₹3,000",
                                totalProgramFee: "₹77,000"
                            }
                        },
                        {
                            name: "B.Sc. Health Administration",
                            duration: "3 Years",
                            details: "Healthcare administration and hospital management",
                            feeStructure: {
                                admissionFee: "₹4,000",
                                semesterFee: "₹12,500",
                                annualFee: "₹23,000",
                                fieldFee: "₹3,200",
                                totalProgramFee: "₹79,700"
                            }
                        },
                        {
                            name: "M.Sc. Public Health",
                            duration: "2 Years",
                            details: "Advanced public health with research and policy focus",
                            feeStructure: {
                                admissionFee: "₹6,000",
                                semesterFee: "₹18,000",
                                annualFee: "₹32,000",
                                researchFee: "₹4,000",
                                totalProgramFee: "₹1,24,000"
                            }
                        }
                    ]
                }
            ]
        },
        {
            id: "engineering",
            name: "Engineering",
            subtitle: "Technical Engineering Education",
            description: "State-of-the-art engineering programs with modern laboratories and industry partnerships for practical learning.",
            icon: "fa-solid fa-cogs",
            iconBg: "from-indigo-500 to-purple-600",
            color: "indigo",
            programs: [
                {
                    name: "Engineering Degrees",
                    type: "B.Tech Programs",
                    details: "Four-year undergraduate engineering programs with comprehensive specialization options across all major engineering disciplines",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "B.Tech Computer Science Engineering",
                            duration: "4 Years",
                            details: "Comprehensive computer science and engineering program with modern curriculum including AI, ML, and software development",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹35,000",
                                annualFee: "₹65,000",
                                laboratoryFee: "₹8,000",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,85,000"
                            }
                        },
                        {
                            name: "B.Tech Information Technology",
                            duration: "4 Years",
                            details: "IT engineering program focusing on information systems, databases, and network technologies",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹34,000",
                                annualFee: "₹64,000",
                                laboratoryFee: "₹7,800",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,81,200"
                            }
                        },
                        {
                            name: "B.Tech Artificial Intelligence & ML",
                            duration: "4 Years",
                            details: "AI and Machine Learning engineering with cutting-edge technology and research focus",
                            feeStructure: {
                                admissionFee: "₹12,000",
                                semesterFee: "₹38,000",
                                annualFee: "₹70,000",
                                laboratoryFee: "₹9,500",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹3,06,000"
                            }
                        },
                        {
                            name: "B.Tech Data Science",
                            duration: "4 Years",
                            details: "Data science engineering program with big data analytics and statistical modeling",
                            feeStructure: {
                                admissionFee: "₹11,000",
                                semesterFee: "₹36,000",
                                annualFee: "₹67,000",
                                laboratoryFee: "₹8,800",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,92,800"
                            }
                        },
                        {
                            name: "B.Tech Mechanical Engineering",
                            duration: "4 Years",
                            details: "Mechanical engineering program with practical workshops and industry exposure",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹32,000",
                                annualFee: "₹60,000",
                                laboratoryFee: "₹7,000",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,70,000"
                            }
                        },
                        {
                            name: "B.Tech Mechanical & Automation",
                            duration: "4 Years",
                            details: "Mechanical engineering with automation and robotics specialization",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹33,000",
                                annualFee: "₹61,000",
                                laboratoryFee: "₹7,500",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,74,000"
                            }
                        },
                        {
                            name: "B.Tech Electrical Engineering",
                            duration: "4 Years",
                            details: "Electrical engineering program with power systems and electronics focus",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹33,000",
                                annualFee: "₹62,000",
                                laboratoryFee: "₹7,500",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,76,000"
                            }
                        },
                        {
                            name: "B.Tech Electrical & Electronics",
                            duration: "4 Years",
                            details: "Combined electrical and electronics engineering with comprehensive coverage",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹34,000",
                                annualFee: "₹63,000",
                                laboratoryFee: "₹8,000",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,78,500"
                            }
                        },
                        {
                            name: "B.Tech Civil Engineering",
                            duration: "4 Years",
                            details: "Civil engineering program with structural and construction focus",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹30,000",
                                annualFee: "₹58,000",
                                laboratoryFee: "₹6,500",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,68,000"
                            }
                        },
                        {
                            name: "B.Tech Civil & Environmental",
                            duration: "4 Years",
                            details: "Civil engineering with environmental sustainability and green building focus",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹31,000",
                                annualFee: "₹59,000",
                                laboratoryFee: "₹7,000",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,70,500"
                            }
                        },
                        {
                            name: "B.Tech Electronics & Communication",
                            duration: "4 Years",
                            details: "Electronics and communication engineering with modern technology focus",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹34,000",
                                annualFee: "₹63,000",
                                laboratoryFee: "₹8,500",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,79,000"
                            }
                        },
                        {
                            name: "B.Tech Electronics & Instrumentation",
                            duration: "4 Years",
                            details: "Electronics engineering with instrumentation and control systems focus",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹33,500",
                                annualFee: "₹62,500",
                                laboratoryFee: "₹8,200",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,77,200"
                            }
                        },
                        {
                            name: "B.Tech Chemical Engineering",
                            duration: "4 Years",
                            details: "Chemical engineering with process design and industrial applications",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹32,500",
                                annualFee: "₹61,000",
                                laboratoryFee: "₹7,800",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,73,800"
                            }
                        },
                        {
                            name: "B.Tech Biotechnology",
                            duration: "4 Years",
                            details: "Biotechnology engineering with genetic engineering and bioprocessing",
                            feeStructure: {
                                admissionFee: "₹11,000",
                                semesterFee: "₹35,000",
                                annualFee: "₹66,000",
                                laboratoryFee: "₹8,500",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,89,000"
                            }
                        },
                        {
                            name: "B.Tech Food Technology",
                            duration: "4 Years",
                            details: "Food technology engineering with food processing and safety focus",
                            feeStructure: {
                                admissionFee: "₹10,000",
                                semesterFee: "₹31,500",
                                annualFee: "₹60,000",
                                laboratoryFee: "₹7,200",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,69,200"
                            }
                        },
                        {
                            name: "B.Tech Agricultural Engineering",
                            duration: "4 Years",
                            details: "Agricultural engineering with farm machinery and irrigation systems",
                            feeStructure: {
                                admissionFee: "₹9,000",
                                semesterFee: "₹28,000",
                                annualFee: "₹54,000",
                                laboratoryFee: "₹6,000",
                                examinationFee: "₹3,000",
                                totalProgramFee: "₹2,50,000"
                            }
                        },
                        {
                            name: "B.Tech Mining Engineering",
                            duration: "4 Years",
                            details: "Mining engineering with mineral extraction and safety protocols",
                            feeStructure: {
                                admissionFee: "₹9,500",
                                semesterFee: "₹29,000",
                                annualFee: "₹56,000",
                                laboratoryFee: "₹6,500",
                                examinationFee: "₹3,200",
                                totalProgramFee: "₹2,58,200"
                            }
                        },
                        {
                            name: "B.Tech Petroleum Engineering",
                            duration: "4 Years",
                            details: "Petroleum engineering with oil and gas exploration technologies",
                            feeStructure: {
                                admissionFee: "₹12,000",
                                semesterFee: "₹36,000",
                                annualFee: "₹68,000",
                                laboratoryFee: "₹9,000",
                                examinationFee: "₹3,800",
                                totalProgramFee: "₹2,96,800"
                            }
                        },
                        {
                            name: "B.Tech Aerospace Engineering",
                            duration: "4 Years",
                            details: "Aerospace engineering with aircraft and spacecraft design",
                            feeStructure: {
                                admissionFee: "₹13,000",
                                semesterFee: "₹40,000",
                                annualFee: "₹75,000",
                                laboratoryFee: "₹10,000",
                                examinationFee: "₹4,000",
                                totalProgramFee: "₹3,22,000"
                            }
                        },
                        {
                            name: "B.Tech Marine Engineering",
                            duration: "4 Years",
                            details: "Marine engineering with ship design and marine propulsion systems",
                            feeStructure: {
                                admissionFee: "₹11,000",
                                semesterFee: "₹34,000",
                                annualFee: "₹65,000",
                                laboratoryFee: "₹8,500",
                                examinationFee: "₹3,500",
                                totalProgramFee: "₹2,85,000"
                            }
                        }
                    ]
                },
                {
                    name: "Polytechnic Courses",
                    type: "Diploma Programs",
                    details: "Three-year diploma programs in comprehensive engineering disciplines with practical training focus",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "Diploma in Mechanical Engineering",
                            duration: "3 Years",
                            details: "Practical mechanical engineering diploma with workshop training and CAD/CAM",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,000",
                                annualFee: "₹28,000",
                                laboratoryFee: "₹4,000",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,02,000"
                            }
                        },
                        {
                            name: "Diploma in Mechanical & Automation",
                            duration: "3 Years",
                            details: "Mechanical engineering with automation, robotics, and PLC programming",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹16,000",
                                annualFee: "₹29,000",
                                laboratoryFee: "₹4,500",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,05,500"
                            }
                        },
                        {
                            name: "Diploma in Electrical Engineering",
                            duration: "3 Years",
                            details: "Electrical engineering diploma with practical electrical systems training",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹16,000",
                                annualFee: "₹30,000",
                                laboratoryFee: "₹4,500",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,08,000"
                            }
                        },
                        {
                            name: "Diploma in Electrical & Electronics",
                            duration: "3 Years",
                            details: "Combined electrical and electronics with power systems and control",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹16,500",
                                annualFee: "₹30,500",
                                laboratoryFee: "₹4,800",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,09,800"
                            }
                        },
                        {
                            name: "Diploma in Civil Engineering",
                            duration: "3 Years",
                            details: "Civil engineering diploma with construction and surveying focus",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹14,000",
                                annualFee: "₹26,000",
                                laboratoryFee: "₹3,500",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹96,000"
                            }
                        },
                        {
                            name: "Diploma in Civil & Environmental",
                            duration: "3 Years",
                            details: "Civil engineering with environmental sustainability and green construction",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹14,500",
                                annualFee: "₹27,000",
                                laboratoryFee: "₹3,800",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹99,300"
                            }
                        },
                        {
                            name: "Diploma in Computer Science",
                            duration: "3 Years",
                            details: "Computer science diploma with programming and software development",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹18,000",
                                annualFee: "₹32,000",
                                laboratoryFee: "₹5,000",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,14,000"
                            }
                        },
                        {
                            name: "Diploma in Computer Engineering",
                            duration: "3 Years",
                            details: "Computer engineering with hardware and software integration",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹17,500",
                                annualFee: "₹31,500",
                                laboratoryFee: "₹4,800",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,10,800"
                            }
                        },
                        {
                            name: "Diploma in Information Technology",
                            duration: "3 Years",
                            details: "IT diploma with database management and network administration",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹17,000",
                                annualFee: "₹31,000",
                                laboratoryFee: "₹4,600",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,08,600"
                            }
                        },
                        {
                            name: "Diploma in Electronics",
                            duration: "3 Years",
                            details: "Electronics diploma with circuit design and communication systems",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹17,000",
                                annualFee: "₹31,000",
                                laboratoryFee: "₹4,800",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,10,600"
                            }
                        },
                        {
                            name: "Diploma in Electronics & Communication",
                            duration: "3 Years",
                            details: "Electronics with communication systems and wireless technologies",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹17,500",
                                annualFee: "₹31,500",
                                laboratoryFee: "₹5,000",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,12,000"
                            }
                        },
                        {
                            name: "Diploma in Electronics & Instrumentation",
                            duration: "3 Years",
                            details: "Electronics with instrumentation and process control systems",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹17,200",
                                annualFee: "₹31,200",
                                laboratoryFee: "₹4,900",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,11,300"
                            }
                        },
                        {
                            name: "Diploma in Chemical Engineering",
                            duration: "3 Years",
                            details: "Chemical engineering with process technology and safety",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,500",
                                annualFee: "₹28,500",
                                laboratoryFee: "₹4,200",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,03,200"
                            }
                        },
                        {
                            name: "Diploma in Biotechnology",
                            duration: "3 Years",
                            details: "Biotechnology with genetic engineering and bioprocessing",
                            feeStructure: {
                                admissionFee: "₹5,500",
                                semesterFee: "₹16,500",
                                annualFee: "₹30,000",
                                laboratoryFee: "₹4,800",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,06,800"
                            }
                        },
                        {
                            name: "Diploma in Food Technology",
                            duration: "3 Years",
                            details: "Food technology with food processing and quality control",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹15,200",
                                annualFee: "₹28,200",
                                laboratoryFee: "₹4,100",
                                examinationFee: "₹2,000",
                                totalProgramFee: "₹1,01,500"
                            }
                        },
                        {
                            name: "Diploma in Agricultural Engineering",
                            duration: "3 Years",
                            details: "Agricultural engineering with farm machinery and irrigation",
                            feeStructure: {
                                admissionFee: "₹4,500",
                                semesterFee: "₹13,000",
                                annualFee: "₹25,000",
                                laboratoryFee: "₹3,500",
                                examinationFee: "₹1,800",
                                totalProgramFee: "₹91,800"
                            }
                        },
                        {
                            name: "Diploma in Mining Engineering",
                            duration: "3 Years",
                            details: "Mining engineering with mineral extraction and safety protocols",
                            feeStructure: {
                                admissionFee: "₹4,800",
                                semesterFee: "₹13,500",
                                annualFee: "₹25,500",
                                laboratoryFee: "₹3,800",
                                examinationFee: "₹1,900",
                                totalProgramFee: "₹93,500"
                            }
                        },
                        {
                            name: "Diploma in Textile Technology",
                            duration: "3 Years",
                            details: "Textile technology with fabric manufacturing and quality control",
                            feeStructure: {
                                admissionFee: "₹4,500",
                                semesterFee: "₹13,200",
                                annualFee: "₹25,200",
                                laboratoryFee: "₹3,600",
                                examinationFee: "₹1,800",
                                totalProgramFee: "₹92,300"
                            }
                        },
                        {
                            name: "Diploma in Leather Technology",
                            duration: "3 Years",
                            details: "Leather technology with tanning and finishing processes",
                            feeStructure: {
                                admissionFee: "₹4,500",
                                semesterFee: "₹13,000",
                                annualFee: "₹25,000",
                                laboratoryFee: "₹3,500",
                                examinationFee: "₹1,800",
                                totalProgramFee: "₹91,800"
                            }
                        },
                        {
                            name: "Diploma in Ceramic Technology",
                            duration: "3 Years",
                            details: "Ceramic technology with material science and manufacturing",
                            feeStructure: {
                                admissionFee: "₹4,800",
                                semesterFee: "₹13,800",
                                annualFee: "₹26,000",
                                laboratoryFee: "₹3,900",
                                examinationFee: "₹1,900",
                                totalProgramFee: "₹94,400"
                            }
                        },
                        {
                            name: "Diploma in Plastic Technology",
                            duration: "3 Years",
                            details: "Plastic technology with polymer science and processing",
                            feeStructure: {
                                admissionFee: "₹4,800",
                                semesterFee: "₹13,500",
                                annualFee: "₹25,500",
                                laboratoryFee: "₹3,700",
                                examinationFee: "₹1,900",
                                totalProgramFee: "₹93,400"
                            }
                        }
                    ]
                }
            ]
        },
        {
            id: "teacher-education",
            name: "Teacher Education",
            subtitle: "Professional Teacher Training",
            description: "Professional teacher training programs with modern pedagogical approaches and practical teaching experience.",
            icon: "fa-solid fa-chalkboard-teacher",
            iconBg: "from-teal-500 to-green-600",
            color: "teal",
            programs: [
                {
                    name: "B.Ed. (Bachelor of Education)",
                    type: "2-Year Teacher Training Program",
                    details: "Comprehensive teacher education program for primary and secondary levels",
                    feeStructure: {
                        admissionFee: "₹4,000",
                        semesterFee: "₹12,000",
                        annualFee: "₹22,000",
                        practicalFee: "₹3,000"
                    }
                },
                {
                    name: "M.Ed. (Master of Education)",
                    type: "2-Year Advanced Teacher Training",
                    details: "Advanced studies in education for experienced teachers",
                    feeStructure: {
                        admissionFee: "₹5,000",
                        semesterFee: "₹15,000",
                        annualFee: "₹28,000",
                        researchFee: "₹4,000"
                    }
                },
                {
                    name: "D.El.Ed. (Diploma in Elementary Education)",
                    type: "2-Year Elementary Teacher Training",
                    details: "Specialized training for elementary school teachers",
                    feeStructure: {
                        admissionFee: "₹3,000",
                        semesterFee: "₹10,000",
                        annualFee: "₹18,000",
                        practicalFee: "₹2,500"
                    }
                }
            ]
        },
        {
            id: "computer-academy",
            name: "Computer Academy",
            subtitle: "IT & Computer Training",
            description: "Specialized computer training programs with latest technology curriculum and industry-standard certifications.",
            icon: "fa-solid fa-laptop-code",
            iconBg: "from-gray-500 to-slate-600",
            color: "gray",
            programs: [
                {
                    name: "Short-term Diploma Programs",
                    type: "Professional Certifications",
                    details: "Industry-focused short-term programs for quick skill development and career enhancement",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "D.C.A. (Diploma in Computer Applications)",
                            duration: "6 Months",
                            details: "Comprehensive computer applications with MS Office, programming basics, and internet",
                            feeStructure: {
                                admissionFee: "₹2,000",
                                courseFee: "₹8,000",
                                examinationFee: "₹1,000",
                                totalProgramFee: "₹11,000"
                            }
                        },
                        {
                            name: "D.C.P. (Diploma in Computer Programming)",
                            duration: "8 Months",
                            details: "Programming fundamentals in C, C++, Java, and web development basics",
                            feeStructure: {
                                admissionFee: "₹2,500",
                                courseFee: "₹10,000",
                                examinationFee: "₹1,200",
                                totalProgramFee: "₹13,700"
                            }
                        },
                        {
                            name: "D.T.P. (Diploma in Desktop Publishing)",
                            duration: "6 Months",
                            details: "Desktop publishing with Adobe Creative Suite, graphic design, and layout",
                            feeStructure: {
                                admissionFee: "₹2,000",
                                courseFee: "₹9,000",
                                examinationFee: "₹1,000",
                                totalProgramFee: "₹12,000"
                            }
                        },
                        {
                            name: "D.W.D. (Diploma in Web Development)",
                            duration: "8 Months",
                            details: "Full-stack web development with HTML, CSS, JavaScript, and modern frameworks",
                            feeStructure: {
                                admissionFee: "₹2,500",
                                courseFee: "₹11,000",
                                examinationFee: "₹1,200",
                                totalProgramFee: "₹14,700"
                            }
                        },
                        {
                            name: "D.D.M. (Diploma in Digital Marketing)",
                            duration: "6 Months",
                            details: "Digital marketing strategies, SEO, social media, and analytics",
                            feeStructure: {
                                admissionFee: "₹2,000",
                                courseFee: "₹9,500",
                                examinationFee: "₹1,000",
                                totalProgramFee: "₹12,500"
                            }
                        },
                        {
                            name: "D.C.C. (Diploma in Computer Course)",
                            duration: "3 Months",
                            details: "Basic computer literacy and essential software applications",
                            feeStructure: {
                                admissionFee: "₹1,500",
                                courseFee: "₹5,000",
                                examinationFee: "₹800",
                                totalProgramFee: "₹7,300"
                            }
                        }
                    ]
                },
                {
                    name: "Undergraduate Programs",
                    type: "Bachelors in Computer Science",
                    details: "Three-year comprehensive programs in computer science and applications with industry exposure",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "B.C.A. (Bachelor of Computer Applications)",
                            duration: "3 Years",
                            details: "Comprehensive computer applications program with programming and software development",
                            feeStructure: {
                                admissionFee: "₹4,000",
                                semesterFee: "₹12,000",
                                annualFee: "₹22,000",
                                laboratoryFee: "₹3,000",
                                totalProgramFee: "₹1,10,000"
                            }
                        },
                        {
                            name: "B.Sc. Computer Science",
                            duration: "3 Years",
                            details: "Computer science program with theoretical foundations and practical applications",
                            feeStructure: {
                                admissionFee: "₹4,000",
                                semesterFee: "₹12,500",
                                annualFee: "₹23,000",
                                laboratoryFee: "₹3,200",
                                totalProgramFee: "₹1,13,200"
                            }
                        },
                        {
                            name: "B.Sc. Information Technology",
                            duration: "3 Years",
                            details: "IT program focusing on information systems, databases, and network technologies",
                            feeStructure: {
                                admissionFee: "₹4,000",
                                semesterFee: "₹12,200",
                                annualFee: "₹22,500",
                                laboratoryFee: "₹3,100",
                                totalProgramFee: "₹1,11,600"
                            }
                        },
                        {
                            name: "B.Sc. Data Science",
                            duration: "3 Years",
                            details: "Data science program with statistics, machine learning, and big data analytics",
                            feeStructure: {
                                admissionFee: "₹4,500",
                                semesterFee: "₹13,000",
                                annualFee: "₹24,000",
                                laboratoryFee: "₹3,500",
                                totalProgramFee: "₹1,17,000"
                            }
                        },
                        {
                            name: "B.Sc. Artificial Intelligence",
                            duration: "3 Years",
                            details: "AI program with machine learning, neural networks, and intelligent systems",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                semesterFee: "₹14,000",
                                annualFee: "₹25,000",
                                laboratoryFee: "₹4,000",
                                totalProgramFee: "₹1,24,000"
                            }
                        }
                    ]
                },
                {
                    name: "Postgraduate Programs",
                    type: "Masters in Computer Science",
                    details: "Advanced computer science programs for graduates with specialization options",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "M.C.A. (Master of Computer Applications)",
                            duration: "2 Years",
                            details: "Advanced computer applications with software engineering and project management",
                            feeStructure: {
                                admissionFee: "₹6,000",
                                semesterFee: "₹18,000",
                                annualFee: "₹32,000",
                                laboratoryFee: "₹4,000",
                                totalProgramFee: "₹1,24,000"
                            }
                        },
                        {
                            name: "M.Sc. Computer Science",
                            duration: "2 Years",
                            details: "Advanced computer science with research focus and specialized electives",
                            feeStructure: {
                                admissionFee: "₹6,000",
                                semesterFee: "₹18,500",
                                annualFee: "₹33,000",
                                laboratoryFee: "₹4,200",
                                totalProgramFee: "₹1,26,200"
                            }
                        },
                        {
                            name: "M.Sc. Information Technology",
                            duration: "2 Years",
                            details: "Advanced IT with enterprise systems, cloud computing, and cybersecurity",
                            feeStructure: {
                                admissionFee: "₹6,000",
                                semesterFee: "₹18,200",
                                annualFee: "₹32,500",
                                laboratoryFee: "₹4,100",
                                totalProgramFee: "₹1,25,600"
                            }
                        },
                        {
                            name: "P.G.D.C.A. (Post Graduate Diploma in Computer Applications)",
                            duration: "1 Year",
                            details: "Intensive computer applications program for working professionals",
                            feeStructure: {
                                admissionFee: "₹5,000",
                                programFee: "₹35,000",
                                examinationFee: "₹2,500",
                                totalProgramFee: "₹42,500"
                            }
                        },
                        {
                            name: "P.G.D.C.S. (Post Graduate Diploma in Computer Science)",
                            duration: "1 Year",
                            details: "Advanced computer science concepts and modern technologies",
                            feeStructure: {
                                admissionFee: "₹5,500",
                                programFee: "₹38,000",
                                examinationFee: "₹2,800",
                                totalProgramFee: "₹46,300"
                            }
                        }
                    ]
                },
                {
                    name: "Professional Certifications",
                    type: "Industry-Recognized Programs",
                    details: "Short-term professional certifications aligned with industry standards and job market demands",
                    hasSubCategories: true,
                    subCategories: [
                        {
                            name: "Microsoft Office Specialist",
                            duration: "3 Months",
                            details: "Certification in MS Office applications (Word, Excel, PowerPoint, Access)",
                            feeStructure: {
                                admissionFee: "₹1,000",
                                courseFee: "₹6,000",
                                certificationFee: "₹2,000",
                                totalProgramFee: "₹9,000"
                            }
                        },
                        {
                            name: "Adobe Creative Suite Certification",
                            duration: "4 Months",
                            details: "Professional certification in Photoshop, Illustrator, InDesign, and Premiere Pro",
                            feeStructure: {
                                admissionFee: "₹1,500",
                                courseFee: "₹8,000",
                                certificationFee: "₹2,500",
                                totalProgramFee: "₹12,000"
                            }
                        },
                        {
                            name: "Cisco CCNA Certification",
                            duration: "6 Months",
                            details: "Cisco Certified Network Associate for networking professionals",
                            feeStructure: {
                                admissionFee: "₹2,000",
                                courseFee: "₹15,000",
                                certificationFee: "₹5,000",
                                totalProgramFee: "₹22,000"
                            }
                        },
                        {
                            name: "AWS Cloud Practitioner",
                            duration: "4 Months",
                            details: "Amazon Web Services cloud computing fundamentals and certification",
                            feeStructure: {
                                admissionFee: "₹1,500",
                                courseFee: "₹12,000",
                                certificationFee: "₹3,000",
                                totalProgramFee: "₹16,500"
                            }
                        },
                        {
                            name: "Python Programming Certification",
                            duration: "3 Months",
                            details: "Comprehensive Python programming with data science applications",
                            feeStructure: {
                                admissionFee: "₹1,000",
                                courseFee: "₹7,000",
                                certificationFee: "₹1,500",
                                totalProgramFee: "₹9,500"
                            }
                        }
                    ]
                }
            ]
        }
    ]

    // COMPLETELY REWRITTEN MODAL LOGIC FROM SCRATCH
    const handleInstitutionCardClick = useCallback((event, institution) => {
        // Prevent default behavior and stop propagation
        event.preventDefault()
        event.stopPropagation()

        console.log('🎯 Institution card clicked:', institution.name)
        console.log('📍 Event target:', event.target)
        console.log('📍 Current target:', event.currentTarget)
        console.log('🔍 Current modal state - isModalOpen:', isModalOpen)
        console.log('🔍 Current modal state - selectedInstitution:', selectedInstitution)

        // Set the selected institution and open modal
        setSelectedInstitution(institution)
        setIsModalOpen(true)

        // Reset all other modal states
        setSelectedProgram(null)
        setIsSubModalOpen(false)
        setSelectedCourse(null)
        setIsCourseModalOpen(false)

        console.log('✅ Modal should now be open for:', institution.name)
        console.log('✅ New modal state - isModalOpen: true')
        console.log('✅ New modal state - selectedInstitution:', institution.name)
    }, [isModalOpen, selectedInstitution])

    const handleProgramCardClick = useCallback((event, program) => {
        // Prevent default behavior and stop propagation
        event.preventDefault()
        event.stopPropagation()

        console.log('🎯 Program card clicked:', program.name)
        console.log('📍 Event target:', event.target)
        console.log('📍 Current target:', event.currentTarget)
        console.log('🔍 Program has sub-categories:', program.hasSubCategories)

        // Set the selected program and open sub modal
        setSelectedProgram(program)
        setIsSubModalOpen(true)

        // Reset course modal state
        setSelectedCourse(null)
        setIsCourseModalOpen(false)

        console.log('✅ Sub modal should now be open for:', program.name)
    }, [])

    const handleCourseCardClick = useCallback((event, course) => {
        // Prevent default behavior and stop propagation
        event.preventDefault()
        event.stopPropagation()

        console.log('🎯 Course card clicked:', course.name)
        console.log('📍 Event target:', event.target)
        console.log('📍 Current target:', event.currentTarget)

        // Set the selected course and open course modal
        setSelectedCourse(course)
        setIsCourseModalOpen(true)

        console.log('✅ Course modal should now be open for:', course.name)
    }, [])

    const handleMainModalClose = useCallback((event) => {
        // Only close if clicking on backdrop, not on modal content
        if (event.target === event.currentTarget) {
            console.log('🔒 Closing main modal - backdrop clicked')
            console.log('🔍 Event target:', event.target)
            console.log('🔍 Event currentTarget:', event.currentTarget)
            setIsModalOpen(false)
            setSelectedInstitution(null)
            setSelectedProgram(null)
            setIsSubModalOpen(false)
            setSelectedCourse(null)
            setIsCourseModalOpen(false)
        } else {
            console.log('🚫 Modal close prevented - clicked on modal content, not backdrop')
            console.log('🔍 Event target:', event.target)
            console.log('🔍 Event currentTarget:', event.currentTarget)
        }
    }, [])

    const handleSubModalClose = useCallback((event) => {
        // Only close if clicking on backdrop, not on modal content
        if (event.target === event.currentTarget) {
            console.log('🔒 Closing sub modal - backdrop clicked')
            setIsSubModalOpen(false)
            setSelectedProgram(null)
            setSelectedCourse(null)
            setIsCourseModalOpen(false)
        }
    }, [])

    const handleCourseModalClose = useCallback((event) => {
        // Only close if clicking on backdrop, not on modal content
        if (event.target === event.currentTarget) {
            console.log('🔒 Closing course modal - backdrop clicked')
            setIsCourseModalOpen(false)
            setSelectedCourse(null)
        }
    }, [])

    const handleCloseButtonClick = useCallback((event, modalType) => {
        // Prevent event bubbling
        event.preventDefault()
        event.stopPropagation()

        if (modalType === 'main') {
            console.log('🔒 Closing main modal - close button clicked')
            setIsModalOpen(false)
            setSelectedInstitution(null)
            setSelectedProgram(null)
            setIsSubModalOpen(false)
            setSelectedCourse(null)
            setIsCourseModalOpen(false)
        } else if (modalType === 'sub') {
            console.log('🔒 Closing sub modal - close button clicked')
            setIsSubModalOpen(false)
            setSelectedProgram(null)
            setSelectedCourse(null)
            setIsCourseModalOpen(false)
        } else if (modalType === 'course') {
            console.log('🔒 Closing course modal - close button clicked')
            setIsCourseModalOpen(false)
            setSelectedCourse(null)
        }
    }, [])

    return (
        <section className="relative py-20 overflow-hidden">
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
                            key={institution.id}
                            onClick={(event) => handleInstitutionCardClick(event, institution)}
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

                            {/* REMOVED PROBLEMATIC HOVER EFFECT DIV */}
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN MODAL - COMPLETELY REWRITTEN */}
            {isModalOpen && selectedInstitution && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleMainModalClose}
                >
                    {/* Modal Content - This prevents event bubbling */}
                    <div
                        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
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
                                    onClick={(event) => handleCloseButtonClick(event, 'main')}
                                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                                >
                                    <i className="fa-solid fa-times text-gray-600"></i>
                                </button>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{selectedInstitution.description}</p>
                        </div>

                        {/* Modal Body - Programs List */}
                        <div className="p-6">
                            <h4 className="text-xl font-semibold text-gray-800 mb-6">Available Programs</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedInstitution.programs.map((program, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer border border-gray-200 hover:border-purple-300"
                                        onClick={(event) => {
                                            if (program.hasWebsite) {
                                                event.preventDefault()
                                                event.stopPropagation()
                                                navigate(program.websiteUrl)
                                            } else {
                                                handleProgramCardClick(event, program)
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-gray-800 mb-2">{program.name}</h5>
                                                <p className="text-sm text-gray-600 mb-2">{program.type}</p>
                                                <p className="text-xs text-gray-500">{program.details}</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {program.hasSubCategories && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            <i className="fa-solid fa-layer-group mr-1"></i>
                                                            Has Sub-Categories
                                                        </span>
                                                    )}
                                                    {program.hasWebsite && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <i className="fa-solid fa-globe mr-1"></i>
                                                            Visit Website
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <i className={`fa-solid ${program.hasWebsite ? 'fa-external-link-alt' : 'fa-chevron-right'} text-purple-500`}></i>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SUB MODAL - COMPLETELY REWRITTEN */}
            {isSubModalOpen && selectedProgram && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleSubModalClose}
                >
                    {/* Sub Modal Content - This prevents event bubbling */}
                    <div
                        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* Sub Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{selectedProgram.name}</h3>
                                    <p className="text-purple-600 font-medium">{selectedProgram.type}</p>
                                </div>
                                <button
                                    onClick={(event) => handleCloseButtonClick(event, 'sub')}
                                    className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm"
                                >
                                    <i className="fa-solid fa-times text-gray-600"></i>
                                </button>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{selectedProgram.details}</p>
                        </div>

                        {/* Sub Modal Body - Show sub-categories if they exist, otherwise show fee structure */}
                        <div className="p-6">
                            {selectedProgram.hasSubCategories ? (
                                // Show sub-categories (for Engineering)
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-6">Available Courses</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedProgram.subCategories.map((course, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer border border-gray-200 hover:border-purple-300"
                                                onClick={(event) => handleCourseCardClick(event, course)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h5 className="font-semibold text-gray-800 mb-2">{course.name}</h5>
                                                        <p className="text-sm text-gray-600 mb-2">{course.duration}</p>
                                                        <p className="text-xs text-gray-500">{course.details}</p>
                                                    </div>
                                                    <div className="ml-4">
                                                        <i className="fa-solid fa-chevron-right text-purple-500"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Show fee structure (for other programs)
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-6">Fee Structure</h4>
                                    <div className="space-y-4">
                                        {Object.entries(selectedProgram.feeStructure).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mr-3"></div>
                                                    <span className="text-gray-700 font-medium capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                    </span>
                                                </div>
                                                <span className="text-lg font-bold text-purple-600">{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Additional Information */}
                                    <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <h5 className="font-semibold text-blue-800 mb-2">Important Notes:</h5>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Fees are subject to change as per institution policy</li>
                                            <li>• Additional charges may apply for practical sessions</li>
                                            <li>• Scholarships available for meritorious students</li>
                                            <li>• Installment payment options available</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sub Modal Footer */}
                        <div className="p-6 border-t border-gray-100">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={(event) => handleCloseButtonClick(event, 'sub')}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Close
                                </button>
                                {!selectedProgram.hasSubCategories && (
                                    <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* COURSE MODAL - NEW THIRD LEVEL */}
            {isCourseModalOpen && selectedCourse && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleCourseModalClose}
                >
                    {/* Course Modal Content - This prevents event bubbling */}
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* Course Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-teal-50">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{selectedCourse.name}</h3>
                                    <p className="text-green-600 font-medium">{selectedCourse.duration}</p>
                                </div>
                                <button
                                    onClick={(event) => handleCloseButtonClick(event, 'course')}
                                    className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm"
                                >
                                    <i className="fa-solid fa-times text-gray-600"></i>
                                </button>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{selectedCourse.details}</p>
                        </div>

                        {/* Course Modal Body - Individual Course Fee Structure */}
                        <div className="p-6">
                            <h4 className="text-xl font-semibold text-gray-800 mb-6">Course Fee Structure</h4>
                            <div className="space-y-4">
                                {Object.entries(selectedCourse.feeStructure).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mr-3"></div>
                                            <span className="text-gray-700 font-medium capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-green-600">{value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Course Highlights */}
                            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
                                <h5 className="font-semibold text-green-800 mb-2">Course Highlights:</h5>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• Industry-aligned curriculum with latest technology</li>
                                    <li>• Practical laboratory sessions and workshops</li>
                                    <li>• Industry internships and project work</li>
                                    <li>• Placement assistance and career guidance</li>
                                    <li>• Modern infrastructure and equipment</li>
                                </ul>
                            </div>
                        </div>

                        {/* Course Modal Footer */}
                        <div className="p-6 border-t border-gray-100">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={(event) => handleCloseButtonClick(event, 'course')}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Close
                                </button>
                                <button className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200">
                                    Apply Now
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