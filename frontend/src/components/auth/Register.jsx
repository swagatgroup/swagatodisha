import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import Swal from 'sweetalert2';
import api from '../../utils/api';
import { LuArrowLeft, LuCheck, LuCircleAlert, LuCircleCheck, LuLoaderCircle, LuUserPlus } from 'react-icons/lu';
import AuthShell from '../site/AuthShell';
import Button from '../site/Button';
import Card from '../site/Card';
import Icon from '../site/Icon';
import { Input } from '../site/Field';
import { LOGO_COLOR, LOGO_SIZE } from '../site/siteConfig';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        referralCode: ''
    });
    const [verifyingReferral, setVerifyingReferral] = useState(false);
    const [referralVerified, setReferralVerified] = useState(false);
    const [referrerName, setReferrerName] = useState('');
    const [referralError, setReferralError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [allowRegistration, setAllowRegistration] = useState(true);
    const [checkingSettings, setCheckingSettings] = useState(true);

    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    // Fetch public settings and capture referral code from URL
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/api/public-settings');
                if (response.data?.success && response.data?.data) {
                    setAllowRegistration(response.data.data.allowRegistration !== false);
                }
            } catch (error) {
                console.error('Error fetching public settings:', error);
                // Default to true if fetch fails so we don't accidentally block
            } finally {
                setCheckingSettings(false);
            }
        };
        fetchSettings();

        const params = new URLSearchParams(location.search);
        const refCode = params.get('ref');
        if (refCode) {
            localStorage.setItem('pendingReferralCode', refCode);
            setFormData(prev => ({ ...prev, referralCode: refCode }));
        }
    }, [location]);

    const handleVerifyReferral = async () => {
        if (!formData.referralCode) {
            setReferralError('Please enter a referral code first');
            return;
        }
        try {
            setVerifyingReferral(true);
            setReferralError('');
            const response = await api.get(`/api/referral/verify/${formData.referralCode}`);
            if (response.data.success) {
                setReferralVerified(true);
                setReferrerName(response.data.referrerName);
            }
        } catch (error) {
            console.error('Error verifying referral code:', error);
            setReferralVerified(false);
            setReferrerName('');
            setReferralError(error.response?.data?.message || 'Invalid referral code');
        } finally {
            setVerifyingReferral(false);
        }
    };

    // Course list removed

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    // Course handlers removed

    // Close dropdown when clicking outside
    useEffect(() => {
        // No dropdowns to manage now
        const noop = () => { };
        document.addEventListener('mousedown', noop);
        return () => {
            document.removeEventListener('mousedown', noop);
        };
    }, []);

    const validateForm = () => {
        // Full name validation
        if (!formData.fullName || formData.fullName.length < 2) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Full name must be at least 2 characters',
                confirmButtonColor: 'rgb(var(--sw-black))'
            });
            return false;
        }
        if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Full name can only contain alphabets and spaces',
                confirmButtonColor: 'rgb(var(--sw-black))'
            });
            return false;
        }

        // Guardian name validation removed

        // Phone number validation (Indian mobile numbers)
        if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Phone number must be a valid 10-digit Indian mobile number',
                confirmButtonColor: 'rgb(var(--sw-black))'
            });
            return false;
        }

        // Email validation
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid email address',
                confirmButtonColor: 'rgb(var(--sw-black))'
            });
            return false;
        }

        // Course validation removed

        // Password validation (Optional - if provided, must be strong)
        if (formData.password) {
            if (formData.password.length < 8) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Password must be at least 8 characters',
                    confirmButtonColor: 'rgb(var(--sw-black))'
                });
                return false;
            }
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
                    confirmButtonColor: 'rgb(var(--sw-black))'
                });
                return false;
            }

            // Confirm password validation
            if (formData.password !== formData.confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Passwords do not match',
                    confirmButtonColor: 'rgb(var(--sw-black))'
                });
                return false;
            }
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
            title: 'Creating Account...',
            text: 'Please wait while we create your account',
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

            const result = await register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: 'student',
                referralCode: referralVerified ? formData.referralCode : undefined
            });

            if (result.success) {

                // Show success alert and redirect to login
                await Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    text: `Welcome ${formData.fullName}! Your account has been created successfully. Please log in to continue.`,
                    confirmButtonColor: 'rgb(var(--sw-black))',
                    confirmButtonText: 'Go to Login',
                    timer: 5000,
                    timerProgressBar: true
                });

                // Redirect to login page with success message
                navigate('/login', {
                    state: {
                        message: 'Registration successful! Please log in with your credentials.',
                        email: formData.email
                    }
                });
            } else {
                console.error('❌ Registration failed:', result.error);

                // Show error alert
                await Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: result.error || 'Registration failed. Please try again.',
                    confirmButtonColor: 'rgb(var(--sw-black))',
                    confirmButtonText: 'Try Again'
                });
            }
        } catch (error) {
            console.error('Registration error:', error);

            // Show error alert
            await Swal.fire({
                icon: 'error',
                title: 'Registration Error',
                text: 'An unexpected error occurred. Please try again.',
                confirmButtonColor: 'rgb(var(--sw-black))',
                confirmButtonText: 'Try Again'
            });
        } finally {
            setLoading(false);
        }
    };

    if (checkingSettings) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-sw-surface-muted" role="status" aria-live="polite">
                <Icon icon={LuLoaderCircle} size="lg" className="animate-spin" />
                <span className="sr-only">Loading</span>
            </div>
        );
    }

    if (!allowRegistration) {
        return (
            <AuthShell backLink={false}>
                <Card variant="soft" className="h-fit w-full max-w-md p-8 text-center">
                    <img className="mx-auto h-16 w-auto" src={LOGO_COLOR} width={LOGO_SIZE.width} height={LOGO_SIZE.height} alt="Swagat Group" />
                    <h1 className="mt-6 text-sw-h2 font-bold">
                        Registrations Closed
                    </h1>
                    <p className="mt-3 text-sw-body text-sw-text-secondary">
                        Currently we are not taking new registrations. Admissions are closed for this season.
                    </p>
                    <div className="mt-8">
                        <Button to="/" variant="outline">
                            Return to Homepage
                        </Button>
                    </div>
                </Card>
            </AuthShell>
        );
    }

    return (
        <AuthShell backLink={false}>
            <Card variant="soft" className="h-fit w-full max-w-2xl p-6 sm:p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <span className="sw-pane sw-pane-notice mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-sw-md text-sw-white">
                        <Icon icon={LuUserPlus} size="lg" strokeWidth={1.5} />
                    </span>
                    <h1 className="text-sw-h2 font-bold">
                        Create Your Account
                    </h1>
                    <p className="mt-1 text-sw-body text-sw-text-secondary">
                        Join Swagat Group of Institutions
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        label="Full Name"
                        required
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                    />

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            label="Email Address"
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                        />
                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            label="Phone Number"
                            required
                            autoComplete="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => handleChange({ target: { name: 'phoneNumber', value: e.target.value.replace(/\D/g, '').slice(0, 10) } })}
                            placeholder="Enter 10-digit mobile number"
                            maxLength="10"
                        />
                    </div>

                    {/* Password Fields */}
                    <div className="space-y-6">
                        <div className="flex flex-col">
                            <PasswordInput
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Leave blank for auto-generated password"
                                autoComplete="new-password"
                                label="Password (Optional)"
                                showStrengthIndicator={true}
                            />
                            <span className="mt-1 text-sw-caption text-sw-text-muted">
                                If left blank, a secure default password will be emailed to you.
                            </span>
                        </div>

                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            label="Confirm Password (Optional)"
                        />
                    </div>

                    {/* Course selection removed */}

                    {/* Referral Code (Optional) */}
                    <div className="rounded-sw-sm bg-sw-surface-muted p-4">
                        <label htmlFor="referralCode" className="mb-1.5 block text-sw-small font-semibold">
                            Referral Code (Optional)
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="referralCode"
                                name="referralCode"
                                type="text"
                                value={formData.referralCode}
                                onChange={(e) => {
                                    handleChange(e);
                                    setReferralVerified(false);
                                    setReferrerName('');
                                    setReferralError('');
                                }}
                                className="block min-h-11 min-w-0 flex-1 rounded-sw-sm bg-sw-white px-4 text-sw-body shadow-sw-input focus:outline-none focus-visible:ring-2 focus-visible:ring-sw-focus"
                                placeholder="Enter referral code"
                            />
                            <Button
                                type="button"
                                shape="rounded"
                                onClick={handleVerifyReferral}
                                disabled={!formData.referralCode || verifyingReferral || referralVerified}
                                loading={verifyingReferral}
                                iconLeft={referralVerified ? LuCheck : undefined}
                            >
                                {referralVerified ? 'Verified' : 'Verify'}
                            </Button>
                        </div>

                        {/* Referral Status Messages */}
                        {referralError && (
                            <p className="mt-2 flex items-center gap-1 text-sw-small font-normal text-sw-error">
                                <Icon icon={LuCircleAlert} size="xs" />
                                {referralError}
                            </p>
                        )}
                        {referralVerified && referrerName && (
                            <p className="mt-2 flex items-center gap-1 text-sw-small font-semibold text-sw-success">
                                <Icon icon={LuCircleCheck} size="xs" />
                                Valid Code! Referred by: {referrerName}
                            </p>
                        )}
                        <p className="mt-2 text-sw-caption text-sw-text-muted">
                            Enter a valid referral code and verify it to apply the referral to your account.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" shape="rounded" size="lg" fullWidth loading={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>

                    {/* Login Link */}
                    <p className="text-center text-sw-small font-normal text-sw-text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="inline-flex min-h-11 items-center font-semibold text-sw-text underline underline-offset-4">
                            Sign in here
                        </Link>
                    </p>
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
        </AuthShell>
    );
};

export default Register;
