const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/AgentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const assignedManagerUI = `
            {/* Assigned Manager Section */}
            {user?.assignedStaff && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#2A1E2E] rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex items-center justify-between"
                >
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Your Assigned Manager</h3>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {user.assignedStaff.firstName} {user.assignedStaff.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.assignedStaff.department} • {user.assignedStaff.email}
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                </motion.div>
            )}
`;

content = content.replace(
    `            {/* 3D Progress Chart — with view tabs */}`,
    `${assignedManagerUI}\n            {/* 3D Progress Chart — with view tabs */}`
);

fs.writeFileSync(file, content);
console.log("Patched AgentDashboard.jsx");
