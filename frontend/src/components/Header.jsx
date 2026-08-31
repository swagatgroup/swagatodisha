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
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
        style={{
          background: 'transparent',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          willChange: 'background-color',
          isolation: 'isolate',
        }}
      >
        <div
          className="container mx-auto px-6"
          style={{ transform: 'none', willChange: 'auto' }}
        >
          <div
            className="flex justify-between items-center py-5"
            style={{ transform: 'none', willChange: 'auto' }}
          >
            {/* Logo */}
            <div className="w-36 flex-shrink-0">
              <img
                src="/Swagat_Logo.png"
                alt="Swagat Group of Institutions"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Desktop Nav — PILL DESIGN (copied from reference) */}
            <nav
              className="hidden lg:flex items-center gap-7 bg-white dark:bg-[#2A1E2E] px-7 py-1.5 rounded-pill shadow-nav border border-[#7B3FA0]/5"
              style={{ transform: 'none', willChange: 'auto' }}
            >
              {NAV_ITEMS.map((item, index) =>
                item.href.startsWith("#") ? (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    className="font-lato font-bold text-sm text-[#1A1A1A] dark:text-[#FAF7F2] hover:text-[#7B3FA0] dark:hover:text-[#A855D0] transition-colors"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.href}
                    className="font-lato font-bold text-sm text-[#1A1A1A] dark:text-[#FAF7F2] hover:text-[#7B3FA0] dark:hover:text-[#A855D0] transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center space-x-3">
              <DarkModeToggle />

              <Link
                to="/login-portal"
                className="px-5 py-2 text-[#7B3FA0] dark:text-[#A855D0] border-2 border-[#7B3FA0] dark:border-[#A855D0] rounded-pill font-bold text-sm hover:bg-[#7B3FA0] dark:hover:bg-[#A855D0] hover:text-white transition-all duration-200"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 bg-[#905391] text-white rounded-pill font-bold text-sm shadow-brand hover:bg-[#5C2D80] transition-all duration-200"
              >
                Register
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={toggleNav}
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
              className="lg:hidden w-11 h-11 bg-white dark:bg-[#2A1E2E] rounded-xl flex items-center justify-center shadow-card border border-[#7B3FA0]/10"
              style={{ transform: 'none', willChange: 'auto', position: 'relative', zIndex: 1 }}
            >
              <div className="flex flex-col justify-center w-6 h-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-6 h-0.5 bg-[#7B3FA0] dark:bg-[#A855D0] rounded-full mb-1 last:mb-0"
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
              className="fixed top-0 left-0 h-full w-[70vw] max-w-sm bg-[#FAF7F2] dark:bg-[#2A1E2E] shadow-2xl z-50 lg:hidden flex flex-col overflow-hidden"
            >
              {/* Sidebar Header — Purple bar like reference */}
              <div className="flex items-center justify-between px-6 py-5 bg-[#905391]">
                <img
                  src="/Swagat_Logo.png"
                  alt="Swagat Group of Institutions"
                  className="w-32 h-auto object-contain brightness-0 invert"
                />
                <div className="flex items-center space-x-2">
                  <DarkModeToggle />
                  <button
                    onClick={toggleNav}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition text-white"
                    aria-label="Close menu"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Links */}
              <nav className="flex-1 px-6 py-8 space-y-2 overflow-auto">
                {NAV_ITEMS.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href.startsWith("#") ? "#" : item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-center gap-3 py-3.5 px-4 text-lg text-[#1A1A1A] dark:text-[#FAF7F2] font-baloo font-semibold rounded-xl hover:bg-[#905391]/10 hover:text-[#905391] dark:hover:text-[#A855D0] transition-all"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Auth Footer */}
              <div className="px-6 pb-8 pt-4 border-t border-[#905391]/15 space-y-3">
                <Link
                  to="/login-portal"
                  onClick={() => setIsNavOpen(false)}
                  className="block py-3 text-center border-2 border-[#7B3FA0] text-[#7B3FA0] dark:text-[#A855D0] dark:border-[#A855D0] rounded-pill font-bold hover:bg-[#7B3FA0] hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsNavOpen(false)}
                  className="block py-3 text-center bg-[#905391] text-white rounded-pill font-bold shadow-brand hover:bg-[#5C2D80] transition"
                >
                  Register
                </Link>
              </div>
            </motion.aside>

          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
