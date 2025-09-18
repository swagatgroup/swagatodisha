import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileMenuTest = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sidebarItems = [
        { id: 'dashboard', name: 'Dashboard', icon: '📊' },
        { id: 'profile', name: 'Profile', icon: '👤' },
        { id: 'settings', name: 'Settings', icon: '⚙️' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
                    <div className="flex justify-between items-center h-16">
                        {/* Left side - Logo and Menu Button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    console.log('Hamburger clicked, current state:', sidebarOpen);
                                    setSidebarOpen(!sidebarOpen);
                                }}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div className="flex items-center lg:ml-0">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">S</span>
                                    </div>
                                </div>
                                <span className="ml-4 text-lg font-semibold text-gray-900">Test Menu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg lg:hidden"
                            style={{ zIndex: 40 }}
                            onAnimationStart={() => console.log('Sidebar animation started')}
                        >
                            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                                <span className="text-lg font-semibold text-gray-900">Menu</span>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                                <nav className="mt-5 flex-1 px-2 space-y-1">
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => {
                                                console.log('Menu item clicked:', item.name);
                                                setSidebarOpen(false);
                                            }}
                                            className="group flex items-center w-full px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        >
                                            <span className="mr-3">{item.icon}</span>
                                            {item.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden bg-gray-50">
                    <main className="flex-1 relative overflow-y-auto focus:outline-none">
                        <div className="py-6">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mobile Menu Test</h1>
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <p className="text-gray-600">
                                        This is a test component to debug the mobile hamburger menu.
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        Current sidebar state: <span className="font-bold">{sidebarOpen ? 'Open' : 'Closed'}</span>
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        Click the hamburger menu (☰) in the top-left corner to test.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MobileMenuTest;
