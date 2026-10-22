import { Link } from 'react-router-dom'
import { LuArrowLeft } from 'react-icons/lu'
import Icon from './Icon'
import { LOGO_SIZE, LOGO_WHITE } from './siteConfig'

// Focused layout for login / registration: black brand bar + centred content
const AuthShell = ({ children, backLink = true }) => (
    <div className="flex min-h-screen flex-col bg-sw-surface-muted">
        <header className="bg-sw-black">
            <div className="flex h-16 items-center justify-between gap-4 px-4 lg:h-20 lg:px-5">
                <Link to="/" className="inline-flex min-h-11 items-center">
                    <img
                        src={LOGO_WHITE}
                        alt="Swagat Group of Institutions"
                        width={LOGO_SIZE.width}
                        height={LOGO_SIZE.height}
                        className="h-9 w-auto lg:h-11"
                    />
                </Link>
                {backLink && (
                    <Link
                        to="/"
                        className="inline-flex min-h-11 items-center gap-2 rounded-sw-pill px-3 text-sw-small font-semibold text-sw-white hover:bg-sw-white/10"
                    >
                        <Icon icon={LuArrowLeft} size="xs" />
                        Back to Home
                    </Link>
                )}
            </div>
        </header>
        <main id="main" className="flex flex-1 justify-center px-4 py-10 md:py-16">
            {children}
        </main>
    </div>
)

export default AuthShell
