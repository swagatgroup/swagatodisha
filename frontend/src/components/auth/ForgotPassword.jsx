import {useState} from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const ForgotPassword = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await api.post('/api/auth/forgot-password', { email });

            if (response.data.success) {
                setSuccess(true);
            } else {
                setError(response.data.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setError(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sw-pill bg-sw-success-bg">
                        <svg className="h-6 w-6 text-sw-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-sw-h3 font-bold">Password Reset Initiated</h2>
                    <p className="mb-6 text-sw-body text-sw-text-secondary">
                        Your password has been reset to the default value. Please contact the admin to change your password.
                    </p>

                    <div className="mb-6 rounded-sw-sm bg-sw-badge-blue p-4 text-left">
                        <h3 className="mb-2 font-semibold">Admin Contact Information</h3>
                        <div className="space-y-1 text-sw-small font-normal">
                            <p><strong>Phone:</strong> +91-78559 59544</p>
                            <p><strong>Email:</strong> admin@swagatodisha.com</p>
                        </div>
                    </div>

                    <button
                        onClick={onBackToLogin}
                        className="flex min-h-11 w-full items-center justify-center rounded-sw-sm bg-sw-black px-4 text-sw-label font-semibold text-sw-white hover:bg-sw-gray-800"
                    >
                        Back to Login
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <div className="text-center mb-6">
                <h2 className="mb-2 text-sw-h3 font-bold">Forgot Password?</h2>
                <p className="text-sw-body text-sw-text-secondary">
                    Enter your email address and we'll reset your password to the default value.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="forgot-email" className="mb-1.5 block text-sw-small font-semibold">
                        Email Address
                    </label>
                    <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block min-h-11 w-full rounded-sw-sm bg-sw-white px-4 text-sw-body shadow-sw-input ring-1 ring-inset ring-sw-border-light focus:outline-none focus-visible:ring-2 focus-visible:ring-sw-focus"
                        placeholder="Enter your email address"
                        required
                    />
                </div>

                {error && (
                    <div className="rounded-sw-sm bg-sw-error-bg p-3">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-sw-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sw-small font-normal text-sw-error">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex min-h-11 w-full items-center justify-center rounded-sw-sm bg-sw-black px-4 text-sw-label font-semibold text-sw-white hover:bg-sw-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </div>
                        ) : (
                            'Reset Password'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onBackToLogin}
                        className="flex min-h-11 w-full items-center justify-center rounded-sw-sm bg-sw-white px-4 text-sw-label font-semibold text-sw-black ring-1 ring-inset ring-sw-black hover:bg-sw-gray-50"
                    >
                        Back to Login
                    </button>
                </div>
            </form>

            <div className="mt-6 rounded-sw-sm bg-sw-warning-bg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-sw-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sw-small font-semibold text-sw-warning">Important Note</h3>
                        <div className="mt-2 text-sw-small font-normal text-sw-warning">
                            <p>Your password will be reset to the default value based on your role:</p>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                                <li>Students: SG@99student</li>
                                <li>Agents: SG@99agent</li>
                                <li>Staff: SG@99staff</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ForgotPassword;
