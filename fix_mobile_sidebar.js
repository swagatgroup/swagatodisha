const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/dashboard/DashboardLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldMobileOverlay = `                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>`;

const newMobileSidebar = `                {/* Mobile Sidebar Overlay & Panel */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            key="mobile-panel"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#2A1E2E] shadow-xl lg:hidden flex flex-col"
                        >
                            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                                <div className="flex items-center flex-shrink-0 px-4 mb-4">
                                    <img src="/Swagat_Favicon.png" alt="Logo" className="h-8 w-auto dark:brightness-0 dark:invert" />
                                    <span className="ml-3 text-xl font-bold text-[#7B3FA0] dark:text-[#A855D0] font-baloo tracking-tight">Swagat</span>
                                </div>
                                <nav className="flex-1 px-2 space-y-1">
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => {
                                                if (onItemClick) onItemClick(item.id);
                                                else navigate(item.href);
                                                setSidebarOpen(false);
                                            }}
                                            className={\`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md \${
                                                activeItem === item.id 
                                                    ? 'bg-[#EDE0F7] dark:bg-[#5C2D80] text-purple-900 dark:text-purple-100' 
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }\`}
                                        >
                                            <span className="flex-shrink-0">{item.icon}</span>
                                            <span className="ml-3">{item.name}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>`;

content = content.replace(oldMobileOverlay, newMobileSidebar);

fs.writeFileSync(file, content);
console.log("Fixed Mobile Sidebar!");
