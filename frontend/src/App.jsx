import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
import LoginDebug from './components/auth/LoginDebug'
import StudentDashboard from './components/dashboard/StudentDashboard'
import AgentDashboard from './components/dashboard/AgentDashboard'
import StaffDashboard from './components/dashboard/StaffDashboard'
import SuperAdminDashboard from './components/dashboard/SuperAdminDashboard'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    console.log('ProtectedRoute - user:', user, 'loading:', loading, 'allowedRoles:', allowedRoles); // Debug log

    if (loading) {
        console.log('ProtectedRoute - showing loading spinner'); // Debug log
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!user) {
        console.log('ProtectedRoute - no user, redirecting to login'); // Debug log
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        console.log('ProtectedRoute - user role not allowed, redirecting to home'); // Debug log
        return <Navigate to="/" replace />;
    }

    console.log('ProtectedRoute - access granted'); // Debug log
    return children;
};

// Main App Component
const AppContent = () => {
    const [isNavOpen, setIsNavOpen] = useState(false)

    return (
        <div className="App relative">
            {/* Premium Floating Elements - Global Animation Layer */}
            <PremiumFloatingElements />

            <Header isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
            <section id="home">
                <HeroCarousel />
            </section>

            {/* About Us with Criss-Cross Pattern Background */}
            <section id="about" className="bg-criss-cross">
                <AboutUs />
            </section>

            {/* Institution Types with Criss-Cross Pattern Background */}
            <section id="programs" className="bg-criss-cross">
                <InstitutionTypes />
            </section>

            {/* Quick Links with Criss-Cross Pattern Background */}
            <section className="bg-criss-cross">
                <QuickLinks />
            </section>

            {/* Admissions Section with Criss-Cross Pattern Background */}
            <section id="admissions" className="bg-criss-cross">
                <Admissions />
            </section>

            {/* Milestone Section */}
            {/* <Milestone /> */}

            {/* Gallery Section */}
            {/* <Gallery /> */}

            {/* Chairman Message Section with Criss-Cross Pattern Background */}
            <section className="py-20 bg-criss-cross relative overflow-hidden">
                {/* Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <ChairmanMessage />
                </div>
            </section>

            {/* Management Team Section with Clean Background */}
            <section className="bg-purple-gradient">
                <Management />
            </section>

            {/* Location Section with Criss-Cross Pattern Background */}
            <section id="contact" className="py-20 bg-criss-cross">
                <div className="container mx-auto px-6">
                    <Location />
                </div>
            </section>

            {/* Contact Us Section with Criss-Cross Pattern Background */}
            <section className="bg-criss-cross">
                <ContactUs />
            </section>

            {/* Footer with Criss-Cross Pattern Background */}
            <section className="bg-criss-cross">
                <Footer />
            </section>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<AppContent />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/debug" element={<LoginDebug />} />

                    {/* Dashboard Routes */}
                    <Route
                        path="/dashboard/student"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/agent"
                        element={
                            <ProtectedRoute allowedRoles={['agent']}>
                                <AgentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/staff"
                        element={
                            <ProtectedRoute allowedRoles={['staff']}>
                                <StaffDashboard />
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
        </AuthProvider>
    )
}

export default App
