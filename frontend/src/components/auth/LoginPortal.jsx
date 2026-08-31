import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApplicationStatusSearch from '../ApplicationStatusSearch';

const LoginPortal = () => {

    const sections = [
        {
            id: 'student',
            title: 'Student Login',
            icon: 'fa-solid fa-user-graduate',
            color: 'from-blue-500 to-cyan-500',
            link: '/login/student',
            description: 'Access your student dashboard, track applications, and manage your profile.'
        },
        {
            id: 'agent',
            title: 'Agent Login',
            icon: 'fa-solid fa-user-tie',
            color: 'from-purple-500 to-pink-500',
            link: '/login/agent',
            description: 'Manage your referrals, track commissions, and view student progress.'
        },
        {
            id: 'staff',
            title: 'Staff Login',
            icon: 'fa-solid fa-users-gear',
            color: 'from-green-500 to-emerald-500',
            link: '/login/staff',
            description: 'Staff portal for administrative tasks, reviews, and system management.'
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A1212] py-12 px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-0">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#7B3FA0] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob"></div>
                <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-[#905391] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B3FA0] to-[#905391]">Swagat Odisha</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 dark:text-gray-300"
                    >
                        Please select your portal to continue or track your application
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {sections.map((section, index) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={section.link} className="block group h-full">
                                <div className="bg-white dark:bg-[#2A1E2E] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full border border-gray-100 dark:border-gray-700 hover:-translate-y-2 relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${section.color} opacity-10 rounded-bl-full transition-transform duration-300 group-hover:scale-110`}></div>
                                    
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <i className={section.icon}></i>
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        {section.title}
                                    </h3>
                                    
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {section.description}
                                    </p>

                                    <div className="mt-6 flex items-center text-[#7B3FA0] dark:text-[#A855D0] font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                        <span>Login Now</span>
                                        <i className="fa-solid fa-arrow-right ml-2"></i>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="bg-white dark:bg-[#2A1E2E] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl mx-auto mb-4">
                                <i className="fa-solid fa-magnifying-glass-location"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Track Your Application</h2>
                            <p className="text-gray-600 dark:text-gray-400">Enter your application ID or phone number to check your admission status instantly.</p>
                        </div>
                        
                        <div className="transform scale-100">
                            <ApplicationStatusSearch />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPortal;
