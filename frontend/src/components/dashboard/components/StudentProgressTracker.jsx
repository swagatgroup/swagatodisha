import React from 'react';
import { motion } from 'framer-motion';

const StudentProgressTracker = ({ currentStage }) => {
    const stages = [
        { id: 'PROFILE_COMPLETION', label: 'Profile Registered' },
        { id: 'DOCUMENT_UPLOAD', label: 'Application Submitted' },
        { id: 'UNDER_REVIEW', label: 'Under Review' },
        { id: 'APPROVED', label: 'Approved' },
        { id: 'COMPLETE', label: 'Enrolled' }
    ];

    // Map the actual backend status to our index
    let currentIndex = 0;
    if (currentStage === 'PROFILE_COMPLETION') currentIndex = 0;
    else if (currentStage === 'DOCUMENT_UPLOAD' || currentStage === 'DRAFT') currentIndex = 1;
    else if (currentStage === 'SUBMITTED') currentIndex = 1;
    else if (currentStage === 'UNDER_REVIEW') currentIndex = 2;
    else if (currentStage === 'APPROVED') currentIndex = 3;
    else if (currentStage === 'COMPLETE') currentIndex = 4;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 overflow-hidden"
        >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-8">Your Application Journey</h3>
            
            <div className="relative flex items-center justify-between w-full pb-6 overflow-x-auto min-w-[600px] px-4">
                {/* Connecting Line (Background) */}
                <div className="absolute left-8 right-8 top-5 -translate-y-1/2 h-1.5 bg-gray-200 dark:bg-gray-700 z-0 rounded-full"></div>
                
                {/* Active Line */}
                <div 
                    className="absolute left-8 top-5 -translate-y-1/2 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 z-0 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `calc(${(currentIndex / (stages.length - 1)) * 100}% - ${currentIndex === 0 ? 0 : 32}px)` }}
                ></div>

                {stages.map((stage, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    
                    return (
                        <div key={stage.id} className="relative z-10 flex flex-col items-center group flex-1">
                            {/* Circle Node */}
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-[3px] transition-all duration-500 shadow-sm
                                    ${isCompleted 
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent text-white scale-110' 
                                        : isCurrent 
                                            ? 'bg-white dark:bg-gray-800 border-purple-500 text-purple-600 dark:text-purple-400 scale-125 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                                    }`}
                            >
                                {isCompleted ? (
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    index + 1
                                )}
                            </div>
                            
                            {/* Label */}
                            <span 
                                className={`absolute top-14 text-xs md:text-sm font-semibold uppercase tracking-wider text-center w-32 transition-all duration-300
                                    ${isCompleted ? 'text-purple-600 dark:text-purple-400' 
                                    : isCurrent ? 'text-blue-600 dark:text-blue-400 font-bold translate-y-1' 
                                    : 'text-gray-400 dark:text-gray-500'}`}
                            >
                                {stage.label}
                            </span>
                            
                            {/* Optional micro-animation ring for current stage */}
                            {isCurrent && (
                                <div className="absolute top-0 w-10 h-10 rounded-full border-2 border-purple-400 animate-ping opacity-20"></div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {currentIndex === 0 && "Complete your profile to start applying to courses."}
                {currentIndex === 1 && "Your application is submitted. Waiting for review."}
                {currentIndex === 2 && "Your application is currently being reviewed by our staff."}
                {currentIndex === 3 && "Congratulations! Your application is approved. Please proceed to payment."}
                {currentIndex === 4 && "You are successfully enrolled! Welcome to Swagat Odisha."}
            </div>
        </motion.div>
    );
};

export default StudentProgressTracker;
