import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuArrowUpRight, LuChevronDown, LuMenu, LuX } from "react-icons/lu";
import { NAV_ITEMS } from "../utils/constants";
import { INSTITUTION_SITES, LOGO_SIZE, LOGO_WHITE } from "./site/siteConfig";
import Icon from "./site/Icon";
import { cx } from "./site/cx";

const INSTITUTIONS_HREF = "#institutions";

// One entry of the Institutions list: internal route or external site
const SiteLink = ({ site, onNavigate, className }) => {
  const content = (
    <>
      <span>
        <span className="block font-semibold">{site.name}</span>
        <span className="block text-sw-small text-sw-text-on-dark-muted">{site.detail}</span>
      </span>
      <Icon icon={LuArrowUpRight} size="xs" className="shrink-0 text-sw-text-on-dark-muted" />
    </>
  );
  return site.external ? (
    <a href={site.href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} className={className}>
      {content}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  ) : (
    <Link to={site.to} onClick={onNavigate} className={className}>
      {content}
    </Link>
  );
};

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isInstitutionsOpen, setIsInstitutionsOpen] = useState(false);
  const [isMobileInstitutionsOpen, setIsMobileInstitutionsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  // Whether the open dropdown came from hover (closes on leave) or click (stays open)
  const openedByRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const toggleNav = () => setIsNavOpen((s) => !s);

  const closeMenus = () => {
    setIsNavOpen(false);
    setIsInstitutionsOpen(false);
  };

  const handleNavClick = (href) => {
    if (href.startsWith("#")) {
      const sectionId = href.substring(1);
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      } else {
        // The section lives on the homepage
        navigate(`/${href}`);
      }
    }
    // For Link navigation we simply close the menus
    closeMenus();
  };

  // Solid header once the page scrolls past the hero edge
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setIsNavOpen(false);
    setIsInstitutionsOpen(false);
  }, [pathname]);

  // Esc closes; outside click closes the dropdown; lock scroll under the mobile menu
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMenus();
    };
    const onPointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsInstitutionsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavOpen]);

  const pillItem =
    "inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-sw-pill px-2.5 text-sw-body font-medium text-sw-white transition-colors duration-sw-fast hover:bg-sw-white/10 xl:px-3 xl:text-sw-label";
  const mobileItem =
    "flex min-h-12 w-full items-center justify-between gap-3 border-b border-sw-white/10 py-3 text-left text-sw-h3 font-semibold text-sw-white";

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-sw-header transition-colors duration-sw",
          isScrolled || isNavOpen ? "bg-sw-black/85 backdrop-blur-sw-glass" : "bg-transparent"
        )}
      >
        <div className="flex h-sw-header items-center justify-between gap-4 px-4 lg:px-5">
          {/* Mobile: menu button */}
          <button
            type="button"
            onClick={toggleNav}
            aria-label={isNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isNavOpen}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-sw-pill text-sw-white hover:bg-sw-white/10 lg:hidden"
          >
            <Icon icon={isNavOpen ? LuX : LuMenu} size="lg" strokeWidth={2.5} />
          </button>

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenus}
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
          >
            <img
              src={LOGO_WHITE}
              alt="Swagat Group of Institutions"
              width={LOGO_SIZE.width}
              height={LOGO_SIZE.height}
              className="h-9 w-auto lg:h-12"
            />
          </Link>

          {/* Desktop nav: glass pill */}
          <nav
            aria-label="Main"
            className="hidden w-max items-center gap-0.5 xl:absolute xl:left-1/2 xl:-translate-x-1/2 rounded-sw-pill bg-sw-glass/90 px-2 py-1 shadow-sw-glass ring-1 ring-inset ring-sw-white/10 backdrop-blur-sw-glass lg:flex"
          >
            {NAV_ITEMS.map((item, index) => {
              if (item.href === INSTITUTIONS_HREF) {
                return (
                  <div
                    key={index}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={() => {
                      if (!isInstitutionsOpen) {
                        openedByRef.current = "hover";
                        setIsInstitutionsOpen(true);
                      }
                    }}
                    onMouseLeave={() => {
                      if (openedByRef.current === "hover") {
                        openedByRef.current = null;
                        setIsInstitutionsOpen(false);
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        // A click after a hover-open pins the menu open instead of closing it
                        if (openedByRef.current === "hover") {
                          openedByRef.current = "click";
                          setIsInstitutionsOpen(true);
                        } else {
                          openedByRef.current = "click";
                          setIsInstitutionsOpen((s) => !s);
                        }
                      }}
                      aria-expanded={isInstitutionsOpen}
                      aria-controls="institutions-menu"
                      className={pillItem}
                    >
                      {item.name}
                      <Icon
                        icon={LuChevronDown}
                        size="xs"
                        className={cx("transition-transform duration-sw-fast", isInstitutionsOpen && "rotate-180")}
                      />
                    </button>
                    {/* pt bridges the gap so hover doesn't drop between trigger and panel */}
                    <div
                      id="institutions-menu"
                      className={cx(
                        "absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 transition-[opacity,visibility] duration-sw-fast",
                        isInstitutionsOpen ? "visible opacity-100" : "invisible opacity-0"
                      )}
                    >
                      <div className="rounded-sw-md bg-sw-black/95 p-2 text-sw-body text-sw-white shadow-2xl ring-1 ring-sw-white/10 backdrop-blur-sw-glass">
                        <button
                          type="button"
                          onClick={() => handleNavClick(item.href)}
                          className="flex min-h-11 w-full items-center rounded-sw-sm px-3 font-semibold hover:bg-sw-white/10"
                        >
                          All institutions
                        </button>
                        <p className="px-3 pb-1 pt-3 text-sw-caption font-semibold uppercase tracking-wide text-sw-text-on-dark-muted">
                          Institution websites
                        </p>
                        <ul>
                          {INSTITUTION_SITES.map((site) => (
                            <li key={`${site.name}-${site.detail}`}>
                              <SiteLink
                                site={site}
                                onNavigate={closeMenus}
                                className="flex min-h-11 items-center justify-between gap-3 rounded-sw-sm px-3 py-2 hover:bg-sw-white/10"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              }
              return item.href.startsWith("#") ? (
                <button key={index} type="button" onClick={() => handleNavClick(item.href)} className={pillItem}>
                  {item.name}
                </button>
              ) : (
                <Link
                  key={index}
                  to={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cx(pillItem, pathname === item.href && "bg-sw-white/10")}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop auth: one pill, two links */}
          <div className="hidden items-center whitespace-nowrap rounded-sw-pill bg-sw-glass/90 px-2 py-1 text-sw-body font-medium xl:text-sw-label text-sw-white shadow-sw-glass ring-1 ring-inset ring-sw-white/10 backdrop-blur-sw-glass lg:flex">
            <Link to="/login-portal" className="inline-flex min-h-11 items-center rounded-sw-pill px-3 hover:bg-sw-white/10">
              Login
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/register" className="inline-flex min-h-11 items-center rounded-sw-pill px-3 hover:bg-sw-white/10">
              Register
            </Link>
          </div>

          {/* Mobile: login pill */}
          <Link
            to="/login-portal"
            className="inline-flex min-h-11 items-center rounded-sw-pill bg-sw-glass/90 px-4 text-sw-small font-semibold text-sw-white ring-1 ring-inset ring-sw-white/10 lg:hidden"
          >
            Login
          </Link>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        id="mobile-menu"
        className={cx(
          "fixed inset-0 z-40 overflow-y-auto bg-sw-black pt-sw-header transition-[opacity,visibility] duration-sw lg:hidden",
          isNavOpen ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <nav aria-label="Mobile" className="flex min-h-full flex-col px-6 pb-10 pt-4">
          <ul>
            {NAV_ITEMS.map((item, index) =>
              item.href === INSTITUTIONS_HREF ? (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => setIsMobileInstitutionsOpen((s) => !s)}
                    aria-expanded={isMobileInstitutionsOpen}
                    aria-controls="mobile-institutions"
                    className={mobileItem}
                  >
                    {item.name}
                    <Icon
                      icon={LuChevronDown}
                      size="sm"
                      className={cx("transition-transform duration-sw-fast", isMobileInstitutionsOpen && "rotate-180")}
                    />
                  </button>
                  <ul id="mobile-institutions" hidden={!isMobileInstitutionsOpen} className="py-2 text-sw-body text-sw-white">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.href)}
                        className="flex min-h-11 w-full items-center font-semibold"
                      >
                        All institutions
                      </button>
                    </li>
                    {INSTITUTION_SITES.map((site) => (
                      <li key={`${site.name}-${site.detail}`}>
                        <SiteLink
                          site={site}
                          onNavigate={closeMenus}
                          className="flex min-h-12 items-center justify-between gap-3 py-1"
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={index}>
                  {item.href.startsWith("#") ? (
                    <button type="button" onClick={() => handleNavClick(item.href)} className={mobileItem}>
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => handleNavClick(item.href)}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={mobileItem}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              )
            )}
          </ul>

          <div className="mt-auto grid gap-3 pt-10">
            <Link
              to="/register"
              onClick={closeMenus}
              className="inline-flex min-h-12 items-center justify-center rounded-sw-pill bg-sw-white text-sw-label font-semibold text-sw-black"
            >
              Register
            </Link>
            <Link
              to="/login-portal"
              onClick={closeMenus}
              className="inline-flex min-h-12 items-center justify-center rounded-sw-pill bg-sw-glass text-sw-label font-semibold text-sw-white ring-1 ring-inset ring-sw-white/10"
            >
              Login
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
