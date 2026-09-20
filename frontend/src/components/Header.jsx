import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import DarkModeToggle from "./shared/DarkModeToggle";
import { NAV_ITEMS } from "../utils/constants";
import {
  RiHomeLine,
  RiInformationLine,
  RiBuildingLine,
  RiAwardLine,
  RiGalleryLine,
  RiCustomerService2Line,
  RiLoginBoxLine,
  RiUserAddLine,
  RiCloseLine,
} from "@remixicon/react";

// Map nav item names → Remix icons for mobile sidebar
const NAV_ICONS = {
  "Home":         <RiHomeLine size={18} />,
  "About Us":     <RiInformationLine size={18} />,
  "Institutions": <RiBuildingLine size={18} />,
  "Approvals":    <RiAwardLine size={18} />,
  "Gallery":      <RiGalleryLine size={18} />,
  "Contact Us":   <RiCustomerService2Line size={18} />,
};

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
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-white/80 dark:bg-[#1A1212]/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 dark:border-gray-800/50"
        style={{
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
            className="flex justify-between items-center py-2.5"
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
            <nav className="hidden lg:flex items-center gap-2" style={{ transform: 'none', willChange: 'auto' }}>
              {NAV_ITEMS.map((item, index) =>
                item.href.startsWith("#") ? (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    className="font-lato font-bold text-sm text-[#1A1A1A] dark:text-[#FAF7F2] hover:text-[#4A1D7A] dark:hover:text-white transition-all bg-white/30 dark:bg-[#231A2E]/40 backdrop-blur-md px-5 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-[#231A2E]/80 shadow-sm"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.href}
                    className="font-lato font-bold text-sm text-[#1A1A1A] dark:text-[#FAF7F2] hover:text-[#4A1D7A] dark:hover:text-white transition-all bg-white/30 dark:bg-[#231A2E]/40 backdrop-blur-md px-5 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-[#231A2E]/80 shadow-sm"
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
                className="flex items-center gap-1.5 px-5 py-2 text-[#4A1D7A] dark:text-[#9B6FCC] border-2 border-[#4A1D7A] dark:border-[#9B6FCC] rounded-pill font-bold text-sm hover:bg-[#4A1D7A] dark:hover:bg-[#9B6FCC] hover:text-white transition-all duration-200"
              >
                <RiLoginBoxLine size={15} />
                Login
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-1.5 px-5 py-2 bg-[#4A1D7A] text-white rounded-pill font-bold text-sm shadow-brand hover:bg-[#351458] transition-all duration-200"
              >
                <RiUserAddLine size={15} />
                Register
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={toggleNav}
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
              className="lg:hidden w-11 h-11 bg-white dark:bg-[#231A2E] rounded-xl flex items-center justify-center shadow-card border border-[#4A1D7A]/10"
              style={{ transform: 'none', willChange: 'auto', position: 'relative', zIndex: 1 }}
            >
              <div className="flex flex-col justify-center w-6 h-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-6 h-0.5 bg-[#4A1D7A] dark:bg-[#9B6FCC] rounded-full mb-1 last:mb-0"
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
              className="fixed top-0 left-0 h-full w-[78vw] max-w-[320px] bg-[#FAF7F2] dark:bg-[#1C1228] shadow-2xl z-50 lg:hidden flex flex-col overflow-hidden"
            >
              {/* Sidebar Header — deep indigo gradient, not flat AI-purple */}
              <div
                className="flex items-center justify-between px-5 py-5"
                style={{ background: "linear-gradient(135deg, #4A1D7A 0%, #231A2E 100%)" }}
              >
                <img
                  src="/Swagat_Logo.png"
                  alt="Swagat Group of Institutions"
                  className="w-28 h-auto object-contain brightness-0 invert"
                />
                <div className="flex items-center gap-2">
                  <DarkModeToggle />
                  <button
                    onClick={toggleNav}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:bg-white/15 transition"
                    aria-label="Close menu"
                  >
                    <RiCloseLine size={20} />
                  </button>
                </div>
              </div>

              {/* Links with Remix icons */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-auto">
                {NAV_ITEMS.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href.startsWith("#") ? "#" : item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-center gap-3 py-3 px-4 text-[#1A1A1A] dark:text-[#FAF7F2] font-baloo font-semibold text-base rounded-xl hover:bg-[#4A1D7A]/8 hover:text-[#4A1D7A] dark:hover:text-[#9B6FCC] transition-all"
                  >
                    <span className="text-[#4A1D7A] dark:text-[#9B6FCC] opacity-75">
                      {NAV_ICONS[item.name] || <RiHomeLine size={18} />}
                    </span>
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Auth Footer */}
              <div className="px-5 pb-8 pt-4 border-t border-[#4A1D7A]/10 dark:border-[#9B6FCC]/15 space-y-3">
                <Link
                  to="/login-portal"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-[#4A1D7A] text-[#4A1D7A] dark:text-[#9B6FCC] dark:border-[#9B6FCC] rounded-pill font-bold hover:bg-[#4A1D7A] hover:text-white transition"
                >
                  <RiLoginBoxLine size={16} />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 bg-[#4A1D7A] text-white rounded-pill font-bold shadow-brand hover:bg-[#351458] transition"
                >
                  <RiUserAddLine size={16} />
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
