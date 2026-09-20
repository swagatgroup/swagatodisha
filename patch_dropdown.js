const fs = require('fs');
const file = 'frontend/src/components/dashboard/DashboardLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the dropdown content
const target = `{/* User Info Section ONLY — Logout moved to sidebar */}
                                        <div className="px-4 py-3 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#1f1623] rounded-md">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {user?.fullName || user?.name || (user?.firstName ? \`\${user.firstName} \${user.lastName || ''}\` : '') || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-300 capitalize mt-0.5 font-medium">
                                                {user?.role ? user.role.replace('_', ' ') : 'User'}
                                            </p>
                                        </div>`;

const replacement = `{/* User Info Section */}
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#1f1623]">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {user?.fullName || user?.name || (user?.firstName ? \`\${user.firstName} \${user.lastName || ''}\` : '') || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-300 capitalize mt-0.5 font-medium">
                                                {user?.role ? user.role.replace('_', ' ') : 'User'}
                                            </p>
                                        </div>
                                        {/* Fresh, simple, no-BS Logout Button */}
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            style={{ cursor: 'pointer' }}
                                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center cursor-pointer pointer-events-auto"
                                        >
                                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                                            Sign Out
                                        </button>`;

content = content.replace(target, replacement);

// Remove mobile sidebar logout
content = content.replace(/{\/\* Mobile Sidebar Logout \*\/}.*?<\/div>/s, '');
// Remove desktop sidebar logout
content = content.replace(/{\/\* Desktop Sidebar Logout \*\/}.*?<\/div>/s, '');

fs.writeFileSync(file, content);
