import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SessionProvider } from './contexts/SessionContext'
import { DarkModeProvider } from './contexts/DarkModeContextSimple'
import Hero from './components/home/Hero'
import PosterCarousel from './components/home/PosterCarousel'
import AboutUs from './components/AboutUs'
import InstitutionTypes from './components/InstitutionTypes'
import Admissions from './components/Admissions'
// import Milestone from './components/Milestone'
// import Gallery from './components/Gallery'
import QuickLinks from './components/QuickLinks'
import ChairmanMessage from './components/ChairmanMessage'
import Management from './components/Management'
import Location from './components/Location'
import ContactUs from './components/ContactUs'
import FloatingContact from './components/FloatingContact'
import Login from './components/auth/Login'
import LoginPortal from './components/auth/LoginPortal'
import Register from './components/auth/Register'
import StudentDashboard from './components/dashboard/StudentDashboard'
import AgentDashboard from './components/dashboard/AgentDashboard'
import StaffDashboard from './components/dashboard/StaffDashboard'
import SuperAdminDashboard from './components/dashboard/SuperAdminDashboard'
import AboutUsPage from './components/AboutUsPage'
import ApprovalsRecognitions from './components/ApprovalsRecognitions'
import Gallery from './components/Gallery'
import ContactPage from './components/ContactPage'
import ApplicationStatusSearch from './components/ApplicationStatusSearch'
import SendMessage from './components/SendMessage'
import TermsAndConditions from './components/legal/TermsAndConditions'
import PrivacyPolicy from './components/legal/PrivacyPolicy'
import SwagatPublicSchoolGhantiguda from './components/schools/SwagatPublicSchoolGhantiguda'
import SwagatPublicSchoolSargiguda from './components/schools/SwagatPublicSchoolSargiguda'
import SwagatPublicSchoolLakhna from './components/schools/SwagatPublicSchoolLakhna'
import SiteRoot from './components/site/SiteRoot'

// Design-system preview: dev server only, never part of a production build
const DesignPreview = import.meta.env.DEV ? lazy(() => import('./components/site/DesignPreview')) : null

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A1D7A]"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Dashboard Router - Routes users to their role-specific dashboard
const DashboardRouter = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A1D7A]"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Route users to their specific dashboards based on role
    switch (user.role) {
        case 'user':
        case 'student':
            return <Navigate to="/dashboard/student" replace />;
        case 'agent':
            return <Navigate to="/dashboard/agent" replace />;
        case 'staff':
            return <Navigate to="/dashboard/staff" replace />;
        case 'super_admin':
            return <Navigate to="/dashboard/admin" replace />;
        default:
            return <Navigate to="/" replace />;
    }
};

// Homepage
const AppContent = () => {
    const { hash } = useLocation()

    // Header links to homepage sections from other pages arrive as /#section
    useEffect(() => {
        if (!hash) return
        const section = document.getElementById(hash.substring(1))
        if (section) section.scrollIntoView()
    }, [hash])

    return (
        <div className="App relative m-0 p-0">
            {/* 1. Hero */}
            <Hero />

            {/* 2. Explore Swagat (quick access: timetables, career roadmap, notifications, results) */}
            <section aria-label="Explore Swagat">
                <QuickLinks />
            </section>

            {/* 3. Admissions posters (admin sliders) */}
            <PosterCarousel />

            {/* 4. Approval and Recognitions */}
            <section id="approvals" aria-label="Approvals and recognitions">
                <ApprovalsRecognitions />
            </section>

            {/* 5. Our Institutions */}
            <section id="institutions" aria-labelledby="institutions-title" className="scroll-mt-sw-header">
                <InstitutionTypes />
            </section>

            {/* 6. Campuses and why choose us */}
            <Location />

            {/* 7. Contact Form */}
            <section id="contact" aria-label="Contact" className="scroll-mt-sw-header">
                <ContactUs />
            </section>
        </div>
    )
}

function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <Router>
                    <DarkModeProvider>
                        <Routes>
                            {/* Public site (redesign v2): marketing pages with the shared header/footer */}
                            <Route element={<SiteRoot chrome />}>
                                <Route path="/" element={<AppContent />} />
                                <Route path="/about" element={<AboutUsPage />} />
                                <Route path="/gallery" element={<Gallery />} />
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="/send-message" element={<SendMessage />} />
                                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                                {/* School Pages */}
                                <Route path="/SwagatPublicSchool_Ghantiguda" element={<SwagatPublicSchoolGhantiguda />} />
                                <Route path="/SwagatPublicSchool_Sargiguda" element={<SwagatPublicSchoolSargiguda />} />
                                <Route path="/SwagatPublicSchool_Lakhna" element={<SwagatPublicSchoolLakhna />} />
                                {DesignPreview && (
                                    <Route path="/_design" element={<Suspense fallback={null}><DesignPreview /></Suspense>} />
                                )}
                            </Route>

                            {/* Public site (redesign v2): login and registration */}
                            <Route element={<SiteRoot />}>
                                <Route path="/login-portal" element={<LoginPortal />} />
                                <Route path="/login/student" element={<Login title="Student Login" />} />
                                <Route path="/login/agent" element={<Login title="Agent Login" />} />
                                <Route path="/login/staff" element={<Login title="Staff Login" />} />
                                <Route path="/register" element={<Register />} />
                            </Route>
                            <Route path="/login" element={<Navigate to="/login-portal" replace />} />

                            {/* General Dashboard Route - redirects to role-specific dashboard */}
                            <Route path="/dashboard" element={<DashboardRouter />} />

                            {/* Role-specific Dashboard Routes */}
                            <Route
                                path="/dashboard/student"
                                element={
                                    <ProtectedRoute allowedRoles={['user', 'student']}>
                                        <SessionProvider>
                                            <StudentDashboard />
                                        </SessionProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard/agent"
                                element={
                                    <ProtectedRoute allowedRoles={['agent']}>
                                        <SessionProvider>
                                            <AgentDashboard />
                                        </SessionProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard/staff"
                                element={
                                    <ProtectedRoute allowedRoles={['staff']}>
                                        <SessionProvider>
                                            <StaffDashboard />
                                        </SessionProvider>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard/admin"
                                element={
                                    <ProtectedRoute allowedRoles={['super_admin']}>
                                        <SessionProvider>
                                            <SuperAdminDashboard />
                                        </SessionProvider>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Catch all route */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        <FloatingContact />
                    </DarkModeProvider>
                </Router>
            </AuthProvider>
        </HelmetProvider>
    )
}

export default App