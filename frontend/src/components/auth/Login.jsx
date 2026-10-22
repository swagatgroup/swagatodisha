import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContextSimple';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import ForgotPassword from './ForgotPassword';
import Swal from 'sweetalert2';
import { LuArrowLeft, LuLoaderCircle, LuUserRound } from 'react-icons/lu';
import AuthShell from '../site/AuthShell';
import Badge from '../site/Badge';
import Button from '../site/Button';
import Card from '../site/Card';
import Icon from '../site/Icon';
import Modal from '../site/Modal';
import { Input } from '../site/Field';

const Login = ({ title }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { login, user, loading: authLoading } = useAuth();
    const { isDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Prevent login form from flashing if user hits the back button while authenticated
    if (authLoading || (token && !user)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-sw-surface-muted" role="status" aria-live="polite">
                <Icon icon={LuLoaderCircle} size="lg" className="animate-spin" />
                <span className="sr-only">Loading</span>
            </div>
        );
    }

    // Redirect already-authenticated users to their dashboard
    // We double check localStorage to avoid React state batching race conditions during logout.
    if (user && token) {
        const dashboardPath = {
            student: '/dashboard/student',
            user: '/dashboard/student',
            agent: '/dashboard/agent',
            staff: '/dashboard/staff',
            super_admin: '/dashboard/admin',
        }[user.role] || '/dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const validateForm = () => {
        // Email validation
        if (!formData.email) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter your email address',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid email address',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }

        // Password validation
        if (!formData.password) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter your password',
                confirmButtonColor: '#7c3aed'
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form using SweetAlert
        if (!validateForm()) {
            return;
        }

        // Show loading alert
        Swal.fire({
            title: 'Signing In...',
            text: 'Please wait while we authenticate you',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            setLoading(true);
            setError('');

            const result = await login(formData.email, formData.password);

            if (result.success) {
                const userRole = result.user.role;
                const userName = result.user.fullName || result.user.email;

                // Show success alert
                await Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: `Welcome back, ${userName}!`,
                    confirmButtonColor: '#7c3aed',
                    confirmButtonText: 'Continue',
                    timer: 2000,
                    timerProgressBar: true
                });

                // Redirect based on user role
                setTimeout(() => {
                    switch (userRole) {
                        case 'student':
                            navigate('/dashboard/student', { replace: true });
                            break;
                        case 'agent':
                            navigate('/dashboard/agent', { replace: true });
                            break;
                        case 'staff':
                            navigate('/dashboard/staff', { replace: true });
                            break;
                        case 'super_admin':
                            navigate('/dashboard/admin', { replace: true });
                            break;
                        default:
                            navigate('/dashboard/student', { replace: true });
                    }
                }, 100);
            } else {

                // Show error alert
                await Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: result.message || 'Invalid credentials. Please try again.',
                    confirmButtonColor: '#7c3aed',
                    confirmButtonText: 'Try Again'
                });
            }
        } catch (err) {
            console.error('Login error:', err);

            // Show error alert
            await Swal.fire({
                icon: 'error',
                title: 'Login Error',
                text: err.response?.data?.message || err.message || 'An unexpected error occurred. Please try again.',
                confirmButtonColor: '#7c3aed',
                confirmButtonText: 'Try Again'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell backLink={false}>
            <Card variant="soft" className="h-fit w-full max-w-md p-6 sm:p-8">
                {/* Header */}
                <div className="text-center">
                    <span className="sw-pane sw-pane-career mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-sw-md text-sw-white">
                        <Icon icon={LuUserRound} size="lg" strokeWidth={1.5} />
                    </span>
                    {title && <Badge tone="neutral" className="mb-3">{title}</Badge>}
                    <h1 className="text-sw-h2 font-bold">
                        Welcome Back
                    </h1>
                    <p className="mt-1 text-sw-body text-sw-text-secondary">
                        Sign in to your account
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email Field */}
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            label="Email Address"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />

                        {/* Password Field */}
                        <PasswordInput
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                            label="Password"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" shape="rounded" size="lg" fullWidth loading={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    {/* Links */}
                    <div className="space-y-1 text-center">
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="inline-flex min-h-11 items-center text-sw-small font-semibold underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </button>
                        </div>

                        <p className="text-sw-small font-normal text-sw-text-secondary">
                            Don't have an account?{' '}
                            <Link to="/register" className="inline-flex min-h-11 items-center font-semibold text-sw-text underline underline-offset-4">
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Back to Home */}
                <div className="mt-4 border-t border-sw-border-light pt-4 text-center">
                    <Link
                        to="/"
                        className="inline-flex min-h-11 items-center gap-1 text-sw-small font-normal text-sw-text-muted hover:text-sw-text"
                    >
                        <Icon icon={LuArrowLeft} size="xs" />
                        Back to Home
                    </Link>
                </div>
            </Card>

            {/* Forgot Password Modal */}
            <Modal open={showForgotPassword} onClose={() => setShowForgotPassword(false)} size="sm">
                <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
            </Modal>
        </AuthShell>
    );
};

export default Login;
