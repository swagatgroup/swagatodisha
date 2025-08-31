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
import AboutUsPage from './components/AboutUsPage'
import InstitutionsPage from './components/InstitutionsPage'
import ApprovalsRecognitions from './components/ApprovalsRecognitions'
import Gallery from './components/Gallery'
import ContactPage from './components/ContactPage'

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

            {/* 1. Slider */}
            <section id="home">
                <HeroCarousel />
            </section>

            {/* 2. Approval and Recognitions */}
            <section className="bg-criss-cross">
                <div className="container mx-auto px-6 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                            <i className="fa-solid fa-medal text-white text-3xl"></i>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                            Approvals & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Recognitions</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our institution operates with full regulatory compliance and holds all necessary approvals from recognized authorities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            { title: "AICTE Approval", icon: "fa-solid fa-certificate", color: "from-purple-500 to-blue-500" },
                            { title: "UGC Recognition", icon: "fa-solid fa-award", color: "from-green-500 to-teal-500" },
                            { title: "State Government Approval", icon: "fa-solid fa-government", color: "from-orange-500 to-red-500" },
                            { title: "ISO Certification", icon: "fa-solid fa-shield-check", color: "from-blue-500 to-indigo-500" },
                            { title: "NAAC Accreditation", icon: "fa-solid fa-star", color: "from-yellow-500 to-orange-500" },
                            { title: "NIRF Ranking", icon: "fa-solid fa-trophy", color: "from-pink-500 to-purple-500" }
                        ].map((approval, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <div className={`w-16 h-16 bg-gradient-to-r ${approval.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                    <i className={`${approval.icon} text-white text-2xl`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{approval.title}</h3>
                                <div className="text-center">
                                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                        <i className="fa-solid fa-check-circle mr-2"></i>
                                        Approved
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Quick Access */}
            <section className="bg-white">
                <QuickLinks />
            </section>

            {/* 4. Our Institutions */}
            <section className="bg-criss-cross">
                <InstitutionTypes />
            </section>

            {/* 5. Location with Small Maps */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                            <i className="fa-solid fa-map-marker-alt text-white text-3xl"></i>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Locations</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{location.name}</h3>

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
                                    <p className="text-gray-600 mb-4">{location.address}</p>
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
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<AppContent />} />
                    <Route path="/about" element={<AboutUsPage />} />
                    <Route path="/institutions" element={<InstitutionsPage />} />
                    <Route path="/approvals" element={<ApprovalsRecognitions />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/contact" element={<ContactPage />} />
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
