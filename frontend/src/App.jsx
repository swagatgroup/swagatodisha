import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { DarkModeProvider } from './contexts/DarkModeContext'
import NotificationToast from './components/shared/NotificationToast'
import Header from './components/Header'
import HeroCarousel from './components/HeroCarousel'
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
import Footer from './components/Footer'
import PremiumFloatingElements from './components/PremiumFloatingElements'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import StudentDashboard from './components/dashboard/StudentDashboard'
import EnhancedAgentDashboard from './components/dashboard/EnhancedAgentDashboard'
import EnhancedStaffDashboard from './components/dashboard/EnhancedStaffDashboard'
import SuperAdminDashboard from './components/dashboard/SuperAdminDashboard'
import AboutUsPage from './components/AboutUsPage'
import ApprovalsRecognitions from './components/ApprovalsRecognitions'
import Gallery from './components/Gallery'
import ContactPage from './components/ContactPage'
import SwagatPublicSchoolGhantiguda from './components/schools/SwagatPublicSchoolGhantiguda'
import SwagatPublicSchoolSargiguda from './components/schools/SwagatPublicSchoolSargiguda'
import SwagatPublicSchoolLakhna from './components/schools/SwagatPublicSchoolLakhna'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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

// Main App Component
const AppContent = () => {
    const [isNavOpen, setIsNavOpen] = useState(false)

    return (
        <div className="App relative m-0 p-0 bg-white dark:bg-gray-900">
            {/* Premium Floating Elements - Global Animation Layer */}
            {/* <PremiumFloatingElements /> */}

            <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />

            {/* 1. Slider */}
            <section id="home" className="m-0 p-0">
                <HeroCarousel />
            </section>


            {/* 2. Quick Access */}
            <section className="bg-white dark:bg-gray-800">
                <QuickLinks />
            </section>

            {/* 3. Approval and Recognitions */}
            <section id="approvals" className="bg-white dark:bg-gray-900">
                <ApprovalsRecognitions />
            </section>

            {/* 4. Our Institutions */}
            <section id="institutions" className="bg-criss-cross">
                <InstitutionTypes />
            </section>

            {/* 5. Location with Small Maps */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                            <i className="fa-solid fa-map-marker-alt text-white text-3xl"></i>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Locations</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Visit us at our state-of-the-art campuses in Sargiguda, Kantabanji, Balangir and Ghantiguda, Sinapali, Nuapada, Odisha
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                name: "Swagat Group of Institutions - Sargiguda",
                                address: "Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, Pin-767039",
                                coordinates: { lat: 20.099885, lng: 82.677498 }
                            },
                            {
                                name: "Swagat Group of Institutions - Ghantiguda",
                                address: "Ghantiguda, PO - Chalna, PS - Sinapali, Nuapada, Odisha, Pin-766108",
                                coordinates: { lat: 20.099885, lng: 82.677498 }
                            }
                        ].map((location, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{location.name}</h3>

                                {/* Small Map */}
                                <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden">
                                    <iframe
                                        src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${location.coordinates.lat},${location.coordinates.lng}&zoom=15&maptype=roadmap`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`${location.name} Location`}
                                    ></iframe>
                                </div>

                                <div className="text-center">
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">{location.address}</p>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Get Directions
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Contact Form with Logo & Company Info */}
            <section className="bg-criss-cross">
                <ContactUs />
            </section>

            {/* Footer */}
            <section className="bg-criss-cross">
                <Footer />
            </section>
        </div>
    )
}

function App() {
    return (
        <HelmetProvider>
            <DarkModeProvider>
                <AuthProvider>
                    <SocketProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<AppContent />} />
                                <Route path="/about" element={<AboutUsPage />} />
                                <Route path="/gallery" element={<Gallery />} />
                                <Route path="/contact" element={<ContactPage />} />

                                {/* School Pages */}
                                <Route path="/SwagatPublicSchool_Ghantiguda" element={<SwagatPublicSchoolGhantiguda />} />
                                <Route path="/SwagatPublicSchool_Sargiguda" element={<SwagatPublicSchoolSargiguda />} />
                                <Route path="/SwagatPublicSchool_Lakhna" element={<SwagatPublicSchoolLakhna />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                {/* General Dashboard Route - redirects to role-specific dashboard */}
                                <Route path="/dashboard" element={<DashboardRouter />} />

                                {/* Role-specific Dashboard Routes */}
                                <Route
                                    path="/dashboard/student"
                                    element={
                                        <ProtectedRoute allowedRoles={['user', 'student']}>
                                            <StudentDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard/agent"
                                    element={
                                        <ProtectedRoute allowedRoles={['agent']}>
                                            <EnhancedAgentDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard/staff"
                                    element={
                                        <ProtectedRoute allowedRoles={['staff']}>
                                            <EnhancedStaffDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard/admin"
                                    element={
                                        <ProtectedRoute allowedRoles={['super_admin']}>
                                            <SuperAdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Catch all route */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Router>
                        <NotificationToast />
                    </SocketProvider>
                </AuthProvider>
            </DarkModeProvider>
        </HelmetProvider>
    )
}

export default App