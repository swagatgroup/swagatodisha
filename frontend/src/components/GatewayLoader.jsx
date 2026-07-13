import React from 'react';
import { motion } from 'framer-motion';

const GatewayLoader = ({ onEnterMainSite }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-[#f8fafc] flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center mt-8"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Swagat Odisha</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto font-medium">
          Choose your destination to continue
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-7xl w-full pb-16 justify-items-center">
        
        {/* Card 1: Swagat Odisha Main Site */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative group w-full max-w-[320px] cursor-pointer"
          onClick={onEnterMainSite}
        >
          <div className="h-72 bg-blue-50 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl shadow-lg border border-blue-100/50">
            <div className="w-20 h-20 bg-white rounded-full mb-6 flex items-center justify-center text-blue-600 text-3xl shadow-sm border border-blue-50">
               <i className="fa-solid fa-building-columns"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-2">Swagat Odisha</h2>
            <p className="text-blue-600 font-medium text-sm">Group of Institutions</p>
          </div>
          
          <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center text-white text-xl shadow-xl border-[5px] border-[#f8fafc] group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
            <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </motion.div>

        {/* Card 2: RCTI Swagat Odisha */}
        <motion.a 
          href="https://www.rcti.swagatodisha.com"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative group w-full max-w-[320px] block"
        >
          <div className="h-72 bg-pink-50 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl shadow-lg border border-pink-100/50">
            <div className="w-20 h-20 bg-white rounded-full mb-6 flex items-center justify-center text-pink-600 text-3xl shadow-sm border border-pink-50">
               <i className="fa-solid fa-laptop-code"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#831843] mb-2">RCTI</h2>
            <p className="text-pink-600 font-medium text-sm">Swagat Odisha</p>
          </div>
          
          <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-[#7c2d12] rounded-full flex items-center justify-center text-white text-xl shadow-xl border-[5px] border-[#f8fafc] group-hover:bg-pink-600 group-hover:scale-110 transition-all duration-300">
            <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </motion.a>

        {/* Card 3: SPS Ghantiguda */}
        <motion.a 
          href="https://www.swagatodisha.com/SwagatPublicSchool_Ghantiguda"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative group w-full max-w-[320px] block"
        >
          <div className="h-72 bg-green-50 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl shadow-lg border border-green-100/50">
            <div className="w-20 h-20 bg-white rounded-full mb-6 flex items-center justify-center text-green-600 text-3xl shadow-sm border border-green-50">
               <i className="fa-solid fa-school"></i>
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Public School</h2>
            <p className="text-green-600 font-medium text-sm">Ghantiguda</p>
          </div>
          <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-[#14532d] rounded-full flex items-center justify-center text-white text-xl shadow-xl border-[5px] border-[#f8fafc] group-hover:bg-green-600 group-hover:scale-110 transition-all duration-300">
            <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </motion.a>

        {/* Card 4: SPS Sargiguda */}
        <motion.a 
          href="https://www.swagatodisha.com/SwagatPublicSchool_Sargiguda"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative group w-full max-w-[320px] block"
        >
          <div className="h-72 bg-purple-50 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl shadow-lg border border-purple-100/50">
            <div className="w-20 h-20 bg-white rounded-full mb-6 flex items-center justify-center text-purple-600 text-3xl shadow-sm border border-purple-50">
               <i className="fa-solid fa-school"></i>
            </div>
            <h2 className="text-2xl font-bold text-purple-900 mb-2">Public School</h2>
            <p className="text-purple-600 font-medium text-sm">Sargiguda</p>
          </div>
          <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-[#4c1d95] rounded-full flex items-center justify-center text-white text-xl shadow-xl border-[5px] border-[#f8fafc] group-hover:bg-purple-600 group-hover:scale-110 transition-all duration-300">
            <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </motion.a>

        {/* Card 5: SPS Lakhna */}
        <motion.a 
          href="https://www.swagatodisha.com/SwagatPublicSchool_Lakhna"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative group w-full max-w-[320px] block"
        >
          <div className="h-72 bg-orange-50 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl shadow-lg border border-orange-100/50">
            <div className="w-20 h-20 bg-white rounded-full mb-6 flex items-center justify-center text-orange-600 text-3xl shadow-sm border border-orange-50">
               <i className="fa-solid fa-school"></i>
            </div>
            <h2 className="text-2xl font-bold text-orange-900 mb-2">Public School</h2>
            <p className="text-orange-600 font-medium text-sm">Lakhna</p>
          </div>
          <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-[#7c2d12] rounded-full flex items-center justify-center text-white text-xl shadow-xl border-[5px] border-[#f8fafc] group-hover:bg-orange-600 group-hover:scale-110 transition-all duration-300">
            <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </motion.a>

        {/* Card 6: Swagat Coaching Centre */}
        <motion.a 
          href="https://www.swagatodisha.com/SwagatCoachingCentre_Bhawanipatna"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative group w-full max-w-[320px] block"
        >
          <div className="h-72 bg-teal-50 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl shadow-lg border border-teal-100/50">
            <div className="w-20 h-20 bg-white rounded-full mb-6 flex items-center justify-center text-teal-600 text-3xl shadow-sm border border-teal-50">
               <i className="fa-solid fa-book-open"></i>
            </div>
            <h2 className="text-2xl font-bold text-teal-900 mb-2">Coaching Centre</h2>
            <p className="text-teal-600 font-medium text-sm">Bhawanipatna</p>
          </div>
          <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-[#134e4a] rounded-full flex items-center justify-center text-white text-xl shadow-xl border-[5px] border-[#f8fafc] group-hover:bg-teal-600 group-hover:scale-110 transition-all duration-300">
            <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </motion.a>

      </div>
    </div>
  );
};

export default GatewayLoader;
