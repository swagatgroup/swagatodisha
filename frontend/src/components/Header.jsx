import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import DarkModeToggle from "./shared/DarkModeToggle";
import { NAV_ITEMS } from "../utils/constants";

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const headerRef = useRef(null);

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  const handleNavClick = (href) => {
    if (href.startsWith("#")) {
      const sectionId = href.substring(1);
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
      setIsNavOpen(false);
    }
  };

  const hamburgerLineVariants = {
    closed: { rotate: 0, y: 0, opacity: 1 },
    open: (i) => ({
      rotate: i === 0 ? 45 : i === 2 ? -45 : 0,
      y: i === 0 ? 6 : i === 2 ? -6 : 0,
      opacity: i === 1 ? 0 : 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    }),
  };

  const sidebarVariants = {
    closed: { x: "-100%", transition: { duration: 0.4 } },
    open: { x: 0, transition: { duration: 0.4 } },
  };

  const overlayVariants = {
    closed: { opacity: 0, transition: { duration: 0.3 } },
    open: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* HEADER */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 shadow-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="w-36">
              <img
                src="/Swagat_Logo.png"
                alt="Logo"
                className="w-full h-full object-contain dark:brightness-0 dark:invert"
              />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-8">
              {NAV_ITEMS.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className="text-gray-800 dark:text-gray-200 font-medium"
                >
                  {item.name}
                </Link>
              ))}

              {/* ✅ DarkModeToggle added for desktop */}
              <DarkModeToggle />
            </nav>

            {/* Mobile Hamburger */}
            <button
              onClick={toggleNav}
              className="lg:hidden w-12 h-12 rounded-xl flex items-center justify-center dark:bg-indigo-300 text-black shadow-lg"
            >
              <div className="flex flex-col justify-center w-6 h-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-6 h-0.5 bg-black rounded-full mb-1 last:mb-0"
                    animate={isNavOpen ? "open" : "closed"}
                    custom={i}
                    variants={hamburgerLineVariants}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isNavOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={toggleNav}
            />

            {/* Sidebar */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="fixed top-0 left-0 h-full w-[70vw] max-w-sm bg-white dark:bg-gray-800 shadow-2xl z-50 lg:hidden"
            >
              <div className="p-6 space-y-6">
                {NAV_ITEMS.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="block text-lg text-gray-800 dark:text-gray-200 font-medium hover:text-purple-600"
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/login"
                    className="block py-3 text-center border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block py-3 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg"
                  >
                    Register
                  </Link>
                </div>

                <DarkModeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
