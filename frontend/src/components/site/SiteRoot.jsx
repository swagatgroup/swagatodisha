import { Outlet } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Header from '../Header'
import Footer from '../Footer'

// Root for every public (non-dashboard) route: scopes the redesign
// base styles (`.site` in styles/site.css) and makes framer-motion
// respect the user's reduced-motion setting. `chrome` adds the shared
// header and footer (marketing pages); auth pages use their own layout.
const SiteRoot = ({ chrome = false }) => (
    <MotionConfig reducedMotion="user">
        <div className="site">
            {chrome && (
                <a
                    href="#main"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-sw-modal focus:rounded-sw-pill focus:bg-sw-white focus:px-4 focus:py-3 focus:font-semibold focus:text-sw-black"
                >
                    Skip to content
                </a>
            )}
            {chrome && <Header />}
            {chrome ? (
                <main id="main">
                    <Outlet />
                </main>
            ) : (
                <Outlet />
            )}
            {chrome && <Footer />}
            {/* Dialogs render here so they stay inside the .site scope */}
            <div id="sw-portal" />
        </div>
    </MotionConfig>
)

export default SiteRoot
