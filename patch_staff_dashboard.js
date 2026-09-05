const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/StaffDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const assignedAgentsUI = `
                        {/* Assigned Agents Section */}
                        {user?.assignedAgents && user.assignedAgents.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-[#2A1E2E] rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Your Assigned Agents ({user.assignedAgents.length})
                                    </h3>
                                    <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {user.assignedAgents.map((agent, index) => (
                                        <div key={agent._id || index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                                            <p className="font-medium text-gray-900 dark:text-white">{agent.fullName || (agent.firstName + ' ' + agent.lastName)}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{agent.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">Ref Code: {agent.referralCode || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
`;

content = content.replace(
    `                        {/* ── Student View Toggle ── */}`,
    `${assignedAgentsUI}\n                        {/* ── Student View Toggle ── */}`
);

fs.writeFileSync(file, content);
console.log("Patched StaffDashboard.jsx");
