import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import DarkModeToggle from "./shared/DarkModeToggle";
import { NAV_ITEMS } from "../utils/constants";

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const headerRef = useRef(null);

  const toggleNav = () => setIsNavOpen((s) => !s);

  const handleNavClick = (href) => {
    if (href.startsWith("#")) {
      const sectionId = href.substring(1);
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
      setIsNavOpen(false);
    } else {
      // For Link navigation we simply close the mobile menu (if open)
      setIsNavOpen(false);
    }
  };

  const hamburgerLineVariants = {
    closed: { rotate: 0, y: 0, opacity: 1 },
    open: (i) => ({
      rotate: i === 0 ? 45 : i === 2 ? -45 : 0,
      y: i === 0 ? 6 : i === 2 ? -6 : 0,
      opacity: i === 1 ? 0 : 1,
      transition: { duration: 0.28, ease: "easeInOut" },
    }),
  };

  const sidebarVariants = {
    closed: { x: "-100%", transition: { duration: 0.35, ease: "easeInOut" } },
    open: { x: 0, transition: { duration: 0.35, ease: "easeInOut" } },
  };

  const overlayVariants = {
    closed: { opacity: 0, transition: { duration: 0.2 } },
    open: { opacity: 1, transition: { duration: 0.2 } },
  };

  return (
    <>
      {/* HEADER */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 shadow-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
        style={{
          transform: 'translateX(0) translateY(0) translateZ(0)',
          willChange: 'auto',
          isolation: 'isolate',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0
        }}
      >
        <div 
          className="container mx-auto px-6"
          style={{
            transform: 'none',
            willChange: 'auto'
          }}
        >
          <div 
            className="flex justify-between items-center py-4"
            style={{
              transform: 'none',
              willChange: 'auto'
            }}
          >
            {/* Logo */}
            <div className="w-36">
              <img
                src="/Swagat_Logo.png"
                alt="Swagat Group of Institutions"
                className="w-full h-full object-contain dark:brightness-0 dark:invert"
              />
            </div>

            {/* Desktop Nav */}
            <nav 
              className="hidden lg:flex items-center space-x-8"
              style={{
                transform: 'none',
                willChange: 'auto'
              }}
            >
              {NAV_ITEMS.map((item, index) =>
                item.href.startsWith("#") ? (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    className="text-gray-800 dark:text-gray-200 font-medium px-2 py-1 hover:text-purple-600"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.href}
                    className="text-gray-800 dark:text-gray-200 font-medium px-2 py-1 hover:text-purple-600"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>

            {/* Desktop Auth (visible on lg only) */}
            <div className="hidden lg:flex items-center space-x-4">
              <DarkModeToggle />

              <Link
                to="/login"
                className="px-5 py-2 text-purple-600 border-2 border-purple-600 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:opacity-95 transition"
              >
                Register
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={toggleNav}
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
              className="lg:hidden w-12 h-12  rounded-xl flex items-center justify-center dark:bg-indigo-300 text-white shadow-lg"
              style={{
                transform: 'none',
                willChange: 'auto',
                position: 'relative',
                zIndex: 1
              }}
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
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="fixed top-0 left-0 h-full w-[70vw] max-w-sm bg-white dark:bg-gray-800 shadow-2xl z-50 lg:hidden"
            >
              <div className="p-6 flex flex-col h-full">
                {/* Sidebar header */}
                <div className="flex items-center justify-between mb-6">
                  <img
                    src="/Swagat_Logo.png"
                    alt="Swagat Group of Institutions"
                    className="w-32 h-auto object-contain dark:brightness-0 dark:invert"
                  />
                  <div className="flex items-center space-x-2">
                    <DarkModeToggle />
                    <button
                      onClick={toggleNav}
                      className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition"
                      aria-label="Close menu"
                    >
                      <svg
                        className="w-4 h-4 text-gray-700 dark:text-gray-200"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Links */}
                <nav className="flex-1 space-y-3 overflow-auto">
                  {NAV_ITEMS.map((item, index) => (
                    <Link
                      key={index}
                      to={item.href.startsWith("#") ? "#" : item.href}
                      onClick={() => handleNavClick(item.href)}
                      className="block py-3 px-3 text-lg text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Auth / Footer */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsNavOpen(false)}
                    className="block py-3 text-center border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setIsNavOpen(false)}
                    className="block py-3 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
