import { useState, useEffect, useRef } from 'react';
import { Bars3Icon, SunIcon, MoonIcon, BellIcon, ChevronDoubleLeftIcon, ChevronLeftIcon, ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// NotificationCenter removed - Socket.IO component
// RealTimeStatus removed - Socket.IO component
import DarkModeToggle from '../shared/DarkModeToggle';
import api from '../../utils/api';
import AllRecentPaymentsModal from './AllRecentPaymentsModal';

const DashboardLayout = ({ children, title, sidebarItems, activeItem, onItemClick, showSessionSelector = true }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [recentPayments, setRecentPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [showAllPaymentsModal, setShowAllPaymentsModal] = useState(false);
    const paymentsRef = useRef(null);
    const { user, logout } = useAuth();
    const { selectedSession, setSelectedSession, availableSessions } = useSession();
    const navigate = useNavigate();
    const location = useLocation();
    const userMenuRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    const closeUserMenu = () => {
        setUserMenuOpen(false);
    };

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (paymentsRef.current && !paymentsRef.current.contains(event.target)) {
                setPaymentsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'student': return 'Student';
            case 'agent': return 'Agent';
            case 'staff': return 'Staff';
            case 'super_admin': return 'Super Admin';
            default: return 'User';
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#1A1212] pattern-bg dark:pattern-bg-dark overflow-hidden">
            {/* Top Navigation Bar */}
            <nav className="flex-none bg-white/80 dark:bg-[#2A1E2E]/80 backdrop-blur-md shadow-sm border-b border-[#7B3FA0]/10 dark:border-white/10 z-20 relative">
                <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
                    <div className="flex justify-between items-center h-16">
                        {/* Left side - Logo and Menu Button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>

                            <div className="flex items-center lg:ml-0">
                                <img
                                    src="/Swagat_Logo.png"
                                    alt="Swagat Logo"
                                    className="h-10 w-auto dark:brightness-0 dark:invert"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/vite.svg';
                                    }}
                                />
                                <div className="hidden sm:flex flex-col ml-3">
                                    <span className="text-xl font-bold font-baloo tracking-tight text-[#7B3FA0] dark:text-[#A855D0] leading-none">
                                        Swagat
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 leading-tight">
                                        Group of Institutions
                                    </span>
                                    <span className="text-[8px] text-gray-400 dark:text-gray-500 tracking-wider">
                                        Education • Innovation • Revolution
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right side - User Menu */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 bg-gray-100 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
                            >
                                <span className="hidden sm:inline">← Main Website</span>
                            </button>

                            {/* Session Switcher for Super Admin */}
                            {user?.role === 'super_admin' && (
                                <div className="hidden md:flex items-center space-x-2 mr-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Session:</span>
                                    <select
                                        value={currentSession}
                                        onChange={(e) => setCurrentSession(e.target.value)}
                                        className="form-select block w-32 pl-3 pr-10 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-[#2A1E2E] dark:text-white focus:outline-none focus:ring-[#7B3FA0] focus:border-[#7B3FA0] rounded-md"
                                    >
                                        {availableSessions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <SunIcon className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <MoonIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                )}
                            </button>

                            {/* Payment Notification Icon */}
                            {user?.role === 'super_admin' && (
                                <div className="relative" ref={paymentsRef}>
                                    <button
                                        onClick={() => setPaymentsOpen(!paymentsOpen)}
                                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors relative"
                                        aria-label="Recent Payments"
                                    >
                                        <BellIcon className="w-5 h-5" />
                                        {recentPayments.length > 0 && (
                                            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-[#2A1E2E]">
                                                {recentPayments.length}
                                            </span>
                                        )}
                                    </button>

                                    {/* Payments Dropdown Menu */}
                                    {paymentsOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#2A1E2E] rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-50">
                                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2A1E2E]/50 rounded-t-lg">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent Payments</h3>
                                                </div>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {recentPayments.length === 0 ? (
                                                    <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No recent payments found.</div>
                                                ) : (
                                                    recentPayments.map((item, idx) => (
                                                        <div key={idx} className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{item.studentName}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2A1E2E]/50 rounded-b-lg">
                                                <button onClick={() => { setPaymentsOpen(false); setShowAllPaymentsModal(true); }} className="w-full text-center text-sm font-medium text-[#7B3FA0]">View All</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B3FA0] to-[#5C2D80] flex items-center justify-center text-white">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2A1E2E] rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-gray-700"
                                        >
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Sign out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
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
                </AnimatePresence>

                {/* Desktop sidebar */}
                <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
                    <div className="flex flex-col w-full h-full relative z-10">
                        <div className="flex flex-col h-full flex-1 bg-white/80 dark:bg-[#2A1E2E]/80 backdrop-blur-md border-r border-[#7B3FA0]/10 dark:border-white/10 relative">
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="absolute top-2 left-2 p-2 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
                            >
                                <ChevronDoubleLeftIcon className={`h-5 w-5 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
                            </button>
                            <div className="flex-1 flex flex-col pt-12 pb-4 overflow-y-auto">
                                <nav className="flex-1 px-2 space-y-1">
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => onItemClick ? onItemClick(item.id) : navigate(item.href)}
                                            className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${activeItem === item.id ? 'bg-[#EDE0F7] text-purple-900' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <span className="flex-shrink-0">{item.icon}</span>
                                            {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`flex-1 overflow-y-auto bg-transparent transition-all duration-300`}>
                    <main className="relative focus:outline-none min-h-full">
                        <div className="py-6">
                            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{title}</h1>
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            {/* All Recent Payments Modal */}
            <AllRecentPaymentsModal 
                isOpen={showAllPaymentsModal} 
                onClose={() => setShowAllPaymentsModal(false)} 
            />
        </div>
    );
};

export default DashboardLayout;
