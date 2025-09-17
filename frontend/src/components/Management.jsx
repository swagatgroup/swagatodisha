import {useState} from 'react';

const Management = () => {
    const [selectedLeader, setSelectedLeader] = useState(null)

    const leadershipTeam = [
        {
            id: 1,
            name: "Mr. G. Meher",
            position: "Chairman & Founder",
            department: "Executive Leadership",
            experience: "25+ Years",
            expertise: "Educational Leadership, Strategic Planning",
            vision: "To create a world-class educational ecosystem that nurtures innovation and excellence",
            achievements: ["Founded 15+ Institutions", "50,000+ Students Impacted", "100+ Industry Partnerships"],
            color: "from-purple-500 to-purple-600"
        },
        {
            id: 2,
            name: "Mr. R.K. Meher",
            position: "Director of Academics",
            department: "Academic Excellence",
            experience: "18+ Years",
            expertise: "Curriculum Development, Quality Assurance",
            vision: "Empowering students with knowledge that transforms lives and shapes futures",
            achievements: ["Curriculum Innovation Award", "Student Success Rate 95%", "Research Publications 50+"],
            color: "from-blue-500 to-blue-600"
        },
        {
            id: 3,
            name: "Mr. S.K. Meher",
            position: "Chief Operations Officer",
            department: "Operations & Management",
            experience: "20+ Years",
            expertise: "Strategic Operations, Resource Management",
            vision: "Building operational excellence that supports educational innovation and growth",
            achievements: ["Operational Efficiency 40%", "Cost Optimization Expert", "Team Leadership 100+"],
            color: "from-green-500 to-green-600"
        },
        {
            id: 4,
            name: "Mr. S. Patel",
            position: "Head of Student Affairs",
            department: "Student Development",
            experience: "15+ Years",
            expertise: "Student Counseling, Career Guidance",
            vision: "Nurturing holistic development and ensuring every student reaches their potential",
            achievements: ["Student Satisfaction 98%", "Career Placement 90%", "Mental Health Advocate"],
            color: "from-orange-500 to-orange-600"
        }
    ]

    return (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl mb-6 shadow-2xl">
                        <i className="fa-solid fa-users-gear text-white text-3xl"></i>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Leadership</span>
                    </h2>

                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Meet the visionary leaders who drive innovation, excellence, and transformation in education
                    </p>
                </div>

                {/* Leadership Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {leadershipTeam.map((leader, index) => (
                        <div
                            key={leader.id}
                            className="group cursor-pointer"
                            onClick={() => setSelectedLeader(leader)}
                        >
                            {/* Leadership Card */}
                            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 overflow-hidden transition-all duration-500 hover:scale-105 hover:bg-white/20 hover:shadow-2xl hover:shadow-purple-500/25">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-2xl"></div>
                                </div>

                                {/* Enhanced Hover Effects */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl"></div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-purple-400 to-blue-400 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom"></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                                                {leader.name}
                                            </h3>
                                            <p className="text-purple-300 font-medium mb-1 group-hover:text-purple-200 transition-colors duration-300">
                                                {leader.position}
                                            </p>
                                            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                                                {leader.department}
                                            </p>
                                        </div>

                                        {/* Experience Badge */}
                                        <div className={`px-4 py-2 bg-gradient-to-r ${leader.color} rounded-full text-white text-sm font-semibold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            {leader.experience}
                                        </div>
                                    </div>

                                    {/* Expertise */}
                                    <div className="mb-6">
                                        <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                                            <span className="text-purple-300 font-medium">Expertise:</span> {leader.expertise}
                                        </p>
                                    </div>

                                    {/* Vision */}
                                    <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-white/10 group-hover:border-purple-400/30 transition-all duration-300">
                                        <p className="text-gray-300 text-sm italic leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                                            "{leader.vision}"
                                        </p>
                                    </div>

                                    {/* Key Achievements */}
                                    <div className="space-y-2">
                                        {leader.achievements.slice(0, 2).map((achievement, idx) => (
                                            <div key={idx} className="flex items-center group-hover:translate-x-2 transition-transform duration-300">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:bg-purple-300 transition-colors duration-300"></div>
                                                <span className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors duration-300">{achievement}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                        Meet Our Full Team
                    </button>
                </div>
            </div>

            {/* Leadership Modal */}
            {selectedLeader && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl w-full bg-gradient-to-br from-gray-900 to-purple-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
                            <h3 className="text-3xl font-bold text-white mb-2">{selectedLeader.name}</h3>
                            <p className="text-purple-100 text-lg">{selectedLeader.position}</p>
                            <p className="text-purple-200 text-base">{selectedLeader.department}</p>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-4">Vision & Mission</h4>
                                    <p className="text-gray-300 leading-relaxed mb-6">
                                        {selectedLeader.vision}
                                    </p>

                                    <h4 className="text-xl font-bold text-white mb-4">Expertise</h4>
                                    <p className="text-gray-300 leading-relaxed">
                                        {selectedLeader.expertise}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-white mb-4">Key Achievements</h4>
                                    <div className="space-y-3">
                                        {selectedLeader.achievements.map((achievement, index) => (
                                            <div key={index} className="flex items-center p-3 bg-white/5 rounded-xl border border-white/10">
                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                                                    <i className="fa-solid fa-trophy text-white text-sm"></i>
                                                </div>
                                                <span className="text-gray-300">{achievement}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="p-8 text-center">
                            <button
                                onClick={() => setSelectedLeader(null)}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Management
