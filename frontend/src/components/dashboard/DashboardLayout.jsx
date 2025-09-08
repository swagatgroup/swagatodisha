import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationCenter from '../shared/NotificationCenter';
import RealTimeStatus from '../shared/RealTimeStatus';

const DashboardLayout = ({ children, title, sidebarItems, activeItem, onItemClick }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, logout } = useAuth();
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
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

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
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
                    <div className="flex justify-between items-center h-16">
                        {/* Left side - Logo and Menu Button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div className="flex items-center lg:ml-0">
                                <div className="flex items-center">
                                    <img
                                        src="/Swagat_Logo.png"
                                        alt="Swagat Logo"
                                        className="h-10 w-auto"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    <div className="hidden h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">S</span>
                                    </div>
                                </div>
                                <Link
                                    to="/"
                                    className="ml-6 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                                >
                                    ← Main Website
                                </Link>
                            </div>
                        </div>

                        {/* Right side - User Menu */}
                        <div className="flex items-center space-x-4">
                            {/* Real-time Status */}
                            <RealTimeStatus />

                            {/* Notifications */}
                            <NotificationCenter />

                            {/* User Menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={toggleUserMenu}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</p>
                                    </div>
                                    <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        <Link
                                            to="/profile"
                                            onClick={closeUserMenu}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Your Profile
                                        </Link>
                                        <Link
                                            to="/settings"
                                            onClick={closeUserMenu}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                closeUserMenu();
                                                handleLogout();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg lg:hidden"
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
                            <nav className="mt-5 px-2">
                                {sidebarItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            if (onItemClick) {
                                                onItemClick(item.id);
                                            } else if (item.href) {
                                                navigate(item.href);
                                            }
                                            setSidebarOpen(false);
                                        }}
                                        className={`group flex items-center w-full px-2 py-2 text-base font-medium rounded-md ${activeItem === item.id
                                            ? 'bg-purple-100 text-purple-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </button>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop Sidebar */}
                <div className="hidden lg:flex lg:flex-shrink-0">
                    <div className="flex flex-col w-64">
                        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
                            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                                <nav className="mt-5 flex-1 px-2 space-y-1">
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => {
                                                if (onItemClick) {
                                                    onItemClick(item.id);
                                                } else if (item.href) {
                                                    navigate(item.href);
                                                }
                                            }}
                                            className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${activeItem === item.id
                                                ? 'bg-purple-100 text-purple-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            {item.icon}
                                            {item.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    <main className="flex-1 relative overflow-y-auto focus:outline-none">
                        <div className="py-6">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
