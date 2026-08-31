const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/QuickLinks.jsx';
let content = fs.readFileSync(path, 'utf8');

const newCareerOptions = `
        plusTwoScience: {
            title: "🔬 +2 Science Stream",
            description: "Foundation for Engineering, Medical & Pure Sciences",
            icon: "fa-solid fa-atom",
            color: "from-blue-500 to-cyan-500",
            paths: [
                {
                    name: "PCM (Physics, Chemistry, Maths)",
                    icon: "fa-solid fa-calculator",
                    description: "Pathway to Engineering & Architecture",
                    careers: [
                        { name: "B.Tech / B.E. (Engineering)", duration: "4 years", scope: "Software, Civil, Mechanical, Electronics, Aerospace" },
                        { name: "B.Arch (Architecture)", duration: "5 years", scope: "Building Design, Urban Planning, Interior Design" },
                        { name: "B.Sc (Physics/Chemistry/Maths/IT)", duration: "3-4 years", scope: "Research, Academics, Data Science" },
                        { name: "BCA (Computer Applications)", duration: "3 years", scope: "Software Development, IT Services" },
                        { name: "NDA (National Defence Academy)", duration: "3 years", scope: "Army, Navy, Air Force" },
                        { name: "Commercial Pilot Training", duration: "18-24 months", scope: "Aviation, Airlines" }
                    ]
                },
                {
                    name: "PCB (Physics, Chemistry, Biology)",
                    icon: "fa-solid fa-dna",
                    description: "Pathway to Medical & Healthcare",
                    careers: [
                        { name: "MBBS (Allopathic Medicine)", duration: "5.5 years", scope: "Doctor, Surgeon, Specialist" },
                        { name: "BDS (Dentistry)", duration: "5 years", scope: "Dental Surgeon, Orthodontist" },
                        { name: "B.Pharm / D.Pharm", duration: "2-4 years", scope: "Pharmacist, Drug Research, Manufacturing" },
                        { name: "B.Sc Nursing", duration: "4 years", scope: "Clinical Nurse, Healthcare Administration" },
                        { name: "BPT (Physiotherapy)", duration: "4.5 years", scope: "Rehabilitation, Sports Medicine" },
                        { name: "BAMS / BHMS (Ayurveda/Homeopathy)", duration: "5.5 years", scope: "Alternative Medicine Practitioner" },
                        { name: "Allied Health Sciences", duration: "3-4 years", scope: "Radiology, Optometry, Lab Tech (BMLT)" }
                    ]
                }
            ]
        },
        plusTwoCommerce: {
            title: "💼 +2 Commerce Stream",
            description: "Foundation for Finance, Business & Accounting",
            icon: "fa-solid fa-chart-line",
            color: "from-green-500 to-emerald-500",
            paths: [
                {
                    name: "Commerce & Accounting",
                    icon: "fa-solid fa-file-invoice-dollar",
                    description: "Core finance and professional accounting",
                    careers: [
                        { name: "CA (Chartered Accountancy)", duration: "4-5 years", scope: "Auditing, Taxation, Financial Advisory" },
                        { name: "CS (Company Secretary)", duration: "3-4 years", scope: "Corporate Governance, Legal Compliance" },
                        { name: "CMA (Cost Management Accounting)", duration: "3-4 years", scope: "Costing, Budgeting, Strategic Management" },
                        { name: "B.Com (General/Hons)", duration: "3-4 years", scope: "Accounting, Banking, Financial Analysis" }
                    ]
                },
                {
                    name: "Business & Management",
                    icon: "fa-solid fa-briefcase",
                    description: "Corporate leadership and administration",
                    careers: [
                        { name: "BBA / BMS", duration: "3 years", scope: "HR, Marketing, Finance, Operations" },
                        { name: "B.A. Economics", duration: "3-4 years", scope: "Economic Analyst, Policy Maker, Banking" },
                        { name: "Integrated MBA", duration: "5 years", scope: "Corporate Management, Entrepreneurship" }
                    ]
                }
            ]
        },
        plusTwoArts: {
            title: "🎨 +2 Arts/Humanities",
            description: "Foundation for Civil Services, Law & Design",
            icon: "fa-solid fa-palette",
            color: "from-pink-500 to-rose-500",
            paths: [
                {
                    name: "Humanities & Social Sciences",
                    icon: "fa-solid fa-book-open",
                    description: "Literature, History, and Society",
                    careers: [
                        { name: "B.A. (History/Pol. Science/English/etc.)", duration: "3-4 years", scope: "Civil Services, Teaching, Research, Content Writing" },
                        { name: "B.A. Psychology", duration: "3-4 years", scope: "Counseling, Clinical Psychology, HR" },
                        { name: "BJMC (Journalism & Mass Comm.)", duration: "3 years", scope: "Media, News, PR, Advertising" }
                    ]
                },
                {
                    name: "Professional Courses (Arts)",
                    icon: "fa-solid fa-gavel",
                    description: "Law, Design, and Hospitality",
                    careers: [
                        { name: "BA LLB (Integrated Law)", duration: "5 years", scope: "Lawyer, Judge, Corporate Legal Advisor" },
                        { name: "B.Des (Design)", duration: "4 years", scope: "Fashion, Interior, Graphic, UI/UX Design" },
                        { name: "BHM (Hotel Management)", duration: "3-4 years", scope: "Hospitality, Tourism, Culinary Arts" },
                        { name: "BFA (Fine Arts)", duration: "3-4 years", scope: "Visual Arts, Animation, Illustration" }
                    ]
                }
            ]
        },
        diplomaAndVocational: {
            title: "🛠️ Diploma & Vocational",
            description: "Skill-based technical and industrial training",
            icon: "fa-solid fa-tools",
            color: "from-orange-500 to-amber-500",
            paths: [
                {
                    name: "Polytechnic Diploma",
                    icon: "fa-solid fa-cogs",
                    description: "3-Year technical diploma after 10th",
                    careers: [
                        { name: "Diploma in Engineering (Civil/Mech/Electrical)", duration: "3 years", scope: "Junior Engineer, Technician, Lateral Entry to B.Tech" },
                        { name: "Diploma in Computer Engineering", duration: "3 years", scope: "Software Trainee, IT Support, Web Development" }
                    ]
                },
                {
                    name: "ITI (Industrial Training Institute)",
                    icon: "fa-solid fa-hard-hat",
                    description: "Short-term industrial skills",
                    careers: [
                        { name: "ITI Electrician / Fitter", duration: "1-2 years", scope: "Industrial Technician, Plant Operator" },
                        { name: "ITI Draftsman / Welder", duration: "1-2 years", scope: "Manufacturing, Construction, Railways" }
                    ]
                },
                {
                    name: "Paramedical Diplomas",
                    icon: "fa-solid fa-x-ray",
                    description: "Short-term healthcare courses",
                    careers: [
                        { name: "DMLT (Medical Lab Tech)", duration: "2 years", scope: "Diagnostic Labs, Hospitals" },
                        { name: "Diploma in Pharmacy", duration: "2 years", scope: "Pharmacy Assistant, Medical Store" }
                    ]
                }
            ]
        }
`;

content = content.replace(
    /const careerOptions = \{[\s\S]*?\n\s{4}\};\n\n\s{4}const quickLinks =/m,
    `const careerOptions = {\n${newCareerOptions}\n    };\n\n    const quickLinks =`
);

fs.writeFileSync(path, content, 'utf8');
