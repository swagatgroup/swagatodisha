import { Outlet } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'

// Root for every public (non-dashboard) route: scopes the redesign
// base styles (`.site` in styles/site.css) and makes framer-motion
// respect the user's reduced-motion setting.
const SiteRoot = () => (
    <MotionConfig reducedMotion="user">
        <div className="site">
            <Outlet />
        </div>
    </MotionConfig>
)

export default SiteRoot
