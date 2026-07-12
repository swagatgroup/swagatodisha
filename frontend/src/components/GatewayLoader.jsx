import React from 'react';
import { motion } from 'framer-motion';

const GatewayLoader = ({ onEnterMainSite }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-[#f8fafc] flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 md:mb-24 text-center mt-8 md:mt-0"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Swagat Odisha</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto font-medium">
          Choose your destination to continue
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 max-w-5xl w-full pb-16">
        
        {/* Card 1: Swagat Odisha Main Site */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative group w-full max-w-[320px] cursor-pointer"
          onClick={onEnterMainSite}
        >
          <div className="h-80 bg-blue-50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl shadow-lg border border-blue-100/50">
            <div className="w-24 h-24 bg-white rounded-full mb-8 flex items-center justify-center text-blue-600 text-4xl shadow-sm border border-blue-50">
               <i className="fa-solid fa-building-columns"></i>
            </div>
            <h2 className="text-3xl font-bold text-[#1e3a8a] mb-3">Swagat Odisha</h2>
            <p className="text-blue-600 font-medium">Group of Institutions</p>
          </div>
          
          {/* Action Button */}
          <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 w-20 h-20 md:w-24 md:h-24 bg-[#1e293b] rounded-full flex items-center justify-center text-white text-2xl shadow-xl border-[6px] border-[#f8fafc] group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
            <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </motion.div>

        {/* Card 2: RCTI Swagat Odisha */}
        <motion.a 
          href="https://www.rcti.swagatodisha.com"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative group w-full max-w-[320px] block"
        >
          <div className="h-80 bg-pink-50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl shadow-lg border border-pink-100/50">
            <div className="w-24 h-24 bg-white rounded-full mb-8 flex items-center justify-center text-pink-600 text-4xl shadow-sm border border-pink-50">
               <i className="fa-solid fa-laptop-code"></i>
            </div>
            <h2 className="text-3xl font-bold text-[#831843] mb-3">RCTI</h2>
            <p className="text-pink-600 font-medium">Swagat Odisha</p>
          </div>
          
          {/* Action Button */}
          <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 w-20 h-20 md:w-24 md:h-24 bg-[#7c2d12] rounded-full flex items-center justify-center text-white text-2xl shadow-xl border-[6px] border-[#f8fafc] group-hover:bg-pink-600 group-hover:scale-110 transition-all duration-300">
            <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </motion.a>
        
      </div>
    </div>
  );
};

export default GatewayLoader;
