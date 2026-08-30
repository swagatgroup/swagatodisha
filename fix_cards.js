const fs = require('fs');
const path = require('path');

const filePath = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the broken block and replace it
const startTag = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">';
const endTag = '</div>\n\n                        {/* ── Student View Toggle ── */}';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
    const fixedContent = `
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Students */}
                            <div
                                onClick={() => setActiveSidebarItem('students')}
                                className="bg-white dark:bg-[#2A1E2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md hover:border-[#7B3FA0]/30 transition-all duration-300"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <svg className="h-6 w-6 text-[#7B3FA0] dark:text-[#A855D0]" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Students</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalStudents}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Total Agents */}
                            <div
                                onClick={() => setActiveSidebarItem('agents')}
                                className="bg-white dark:bg-[#2A1E2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md hover:border-[#7B3FA0]/30 transition-all duration-300"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <svg className="h-6 w-6 text-[#7B3FA0] dark:text-[#A855D0]" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                                            <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 016.576-3.036c.32.32.61.666.868 1.042l-3.874-2.052z" />
                                            <path d="M18.918 14.254a8.287 8.287 0 011.308 5.135 9.687 9.687 0 001.764-.44l.115-.04a.563.563 0 00.373-.487l.01-.121a3.75 3.75 0 00-6.576-3.036c-.32.32-.61.666-.868 1.042l3.874-2.052z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Agents</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalAgents}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Total Staff */}
                            <div
                                onClick={() => setActiveSidebarItem('staff')}
                                className="bg-white dark:bg-[#2A1E2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md hover:border-[#7B3FA0]/30 transition-all duration-300"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <svg className="h-6 w-6 text-[#7B3FA0] dark:text-[#A855D0]" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-.75.75v3.75a.75.75 0 001.5 0V12a.75.75 0 00-.75-.75zm3.75-1.5a.75.75 0 00-.75.75v5.25a.75.75 0 001.5 0v-5.25a.75.75 0 00-.75-.75zM9 5.25a.75.75 0 00-.75.75v2.25a.75.75 0 001.5 0V6a.75.75 0 00-.75-.75z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Staff</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalStaff}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Applications */}
                            <div className="bg-white dark:bg-[#2A1E2E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md hover:border-[#7B3FA0]/30 transition-all duration-300">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <svg className="h-6 w-6 text-[#7B3FA0] dark:text-[#A855D0]" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 12a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V12zM12 16.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                            <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Apps</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingApplications}</p>
                                    </div>
                                </div>
                            </div>
`;
    
    // Include the start tag and replace up to endTag
    content = content.substring(0, content.indexOf('{/* Stats Cards */}')) + fixedContent + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf8');
}
