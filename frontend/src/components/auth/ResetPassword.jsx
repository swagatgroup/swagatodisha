import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LuCircleAlert, LuCircleCheck, LuKeyRound } from 'react-icons/lu';
import api from '../../utils/api';
import PasswordInput from './PasswordInput';
import AuthShell from '../site/AuthShell';
import Button from '../site/Button';
import Card from '../site/Card';
import Icon from '../site/Icon';

// Landing page for the emailed reset link: /reset-password/:token
const ResetPassword = () => {
    const { token } = useParams();
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const validate = () => {
        if (formData.password.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
            return 'Password must include at least one letter and one number.';
        }
        if (formData.password !== formData.confirmPassword) return 'The two passwords don\'t match.';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const problem = validate();
        if (problem) {
            setError(problem);
            return;
        }

        try {
            setLoading(true);
            const response = await api.put(`/api/auth/reset-password/${token}`, { newPassword: formData.password });
            if (response.data.success) {
                setDone(true);
            } else {
                setError(response.data.message || 'Could not reset the password. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Could not reset the password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell>
            <Helmet>
                <title>Reset password | Swagat Group of Institutions</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            <Card variant="soft" className="h-fit w-full max-w-md p-6 sm:p-8">
                {done ? (
                    <div className="text-center" role="status" aria-live="polite">
                        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sw-pill bg-sw-success-bg text-sw-success">
                            <Icon icon={LuCircleCheck} size="md" />
                        </span>
                        <h1 className="mb-2 text-sw-h2 font-bold">Password updated</h1>
                        <p className="mb-6 text-sw-body text-sw-text-secondary">
                            Your password has been reset. You can now sign in with your new password.
                        </p>
                        <Button to="/login-portal" shape="rounded" fullWidth>
                            Go to Login
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 text-center">
                            <span className="sw-pane sw-pane-career mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-sw-md text-sw-white">
                                <Icon icon={LuKeyRound} size="lg" strokeWidth={1.5} />
                            </span>
                            <h1 className="text-sw-h2 font-bold">Choose a new password</h1>
                            <p className="mt-1 text-sw-body text-sw-text-secondary">
                                Use at least 8 characters, with a letter and a number.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="New password"
                                autoComplete="new-password"
                                label="New Password"
                                showStrengthIndicator={true}
                                required
                            />
                            <PasswordInput
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Type it again"
                                autoComplete="new-password"
                                label="Confirm New Password"
                                required
                            />

                            {error && (
                                <div role="alert" className="flex items-start gap-2 rounded-sw-sm bg-sw-error-bg p-3 text-sw-small font-normal text-sw-error">
                                    <Icon icon={LuCircleAlert} size="xs" className="mt-0.5 shrink-0" />
                                    <span>
                                        {error}
                                        {/expired|invalid/i.test(error) && (
                                            <>
                                                {' '}
                                                <Link to="/login-portal" className="font-semibold underline underline-offset-4">
                                                    Request a new link
                                                </Link>
                                            </>
                                        )}
                                    </span>
                                </div>
                            )}

                            <Button type="submit" shape="rounded" size="lg" fullWidth loading={loading}>
                                {loading ? 'Saving...' : 'Reset password'}
                            </Button>
                        </form>
                    </>
                )}
            </Card>
        </AuthShell>
    );
};

export default ResetPassword;
