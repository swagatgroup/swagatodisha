const fs = require('fs');
const path = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/AboutUsPage.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('const [staffProfiles, setStaffProfiles] = useState([])')) {
    content = content.replace(
        "import React from 'react'",
        "import React, { useState, useEffect } from 'react'\nimport axios from 'axios';"
    );

    content = content.replace(
        "const AboutUsPage = () => {",
        "const AboutUsPage = () => {\n    const [staffProfiles, setStaffProfiles] = useState([]);\n\n    useEffect(() => {\n        const fetchContent = async () => {\n            try {\n                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';\n                const res = await axios.get(`${API_URL}/api/website-content`);\n                if (res.data && res.data.data && res.data.data.staffProfiles) {\n                    setStaffProfiles(res.data.data.staffProfiles.filter(s => s.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0)));\n                }\n            } catch (err) {\n                console.error(err);\n            }\n        };\n        fetchContent();\n    }, []);\n"
    );

    const staffHtml = `
            {/* Staff Profiles Section */}
            {staffProfiles.length > 0 && (
                <div className="py-20 bg-white dark:bg-[#1A1212] relative z-10">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Team</h2>
                            <div className="w-24 h-1 bg-[#7B3FA0] mx-auto rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
                            {staffProfiles.map((staff, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-[#2A1E2E] rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition duration-300">
                                    <img 
                                        src={staff.image || '/Swagat_Favicon.png'} 
                                        alt={staff.name}
                                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white dark:border-[#1A1212] shadow-lg mb-4"
                                    />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{staff.name}</h3>
                                    <p className="text-sm text-[#7B3FA0] dark:text-[#A855D0] font-medium">{staff.designation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
    `;

    // Insert right before the Footer or the closing div
    content = content.replace(
        "        </div>\n    )\n}",
        staffHtml + "        </div>\n    )\n}"
    );

    fs.writeFileSync(path, content, 'utf8');
}
