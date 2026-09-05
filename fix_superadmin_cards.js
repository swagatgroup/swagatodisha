const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/SuperAdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCards = `                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div 
                                            onClick={() => handleStatClick('all')}
                                            className="bg-white dark:bg-[#2A1E2E] rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{active.total || 0}</p>
                                        </div>
                                        <div 
                                            onClick={() => handleStatClick('APPROVED')}
                                            className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 border border-teal-200 dark:border-teal-800 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-xs text-teal-600 dark:text-teal-400">Approved</p>
                                            <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{active.approved || 0}</p>
                                        </div>
                                        <div 
                                            onClick={() => handleStatClick('SUBMITTED')}
                                            className="bg-white dark:bg-[#2A1E2E] rounded-lg p-3 border border-blue-200 dark:border-blue-800 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-xs text-[#387B95] dark:text-[#60A5FA]">Submitted</p>
                                            <p className="text-2xl font-bold text-[#1D4B5E] dark:text-blue-300">{active.submitted || 0}</p>
                                        </div>
                                    </div>`;

const newCards = `                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                        <div 
                                            onClick={() => handleStatClick('all')}
                                            className="bg-white dark:bg-[#2A1E2E] rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{active.total || 0}</p>
                                        </div>
                                        <div 
                                            onClick={() => handleStatClick('SUBMITTED')}
                                            className="bg-white dark:bg-[#2A1E2E] rounded-lg p-3 border border-blue-200 dark:border-blue-800 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-xs text-[#387B95] dark:text-[#60A5FA]">Submitted</p>
                                            <p className="text-2xl font-bold text-[#1D4B5E] dark:text-blue-300">{active.submitted || 0}</p>
                                        </div>
                                        <div 
                                            onClick={() => handleStatClick('APPROVED')}
                                            className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 border border-teal-200 dark:border-teal-800 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-xs text-teal-600 dark:text-teal-400">Approved</p>
                                            <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{active.approved || 0}</p>
                                        </div>
                                        <div 
                                            onClick={() => handleStatClick('COMPLETE')}
                                            className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <p className="text-xs text-green-600 dark:text-green-400">Complete</p>
                                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{active.complete || 0}</p>
                                        </div>
                                    </div>`;

content = content.replace(oldCards, newCards);
fs.writeFileSync(file, content);
console.log("Fixed SuperAdminDashboard.jsx");
