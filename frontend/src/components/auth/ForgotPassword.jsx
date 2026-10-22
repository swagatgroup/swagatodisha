import {useState} from 'react';
import { LuCircleAlert, LuMailCheck } from 'react-icons/lu';
import api from '../../utils/api';
import { CONTACT_INFO } from '../../utils/constants';
import Button from '../site/Button';
import Icon from '../site/Icon';
import { Input } from '../site/Field';

// Requests an emailed, single-use reset link. The answer is the same whether
// or not the email has an account, so nothing about accounts is revealed.
const ForgotPassword = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');
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
                setMessage(response.data.message);
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
            <div className="w-full text-center" role="status" aria-live="polite">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sw-pill bg-sw-success-bg text-sw-success">
                    <Icon icon={LuMailCheck} size="md" />
                </span>
                <h2 className="mb-2 text-sw-h3 font-bold">Check your email</h2>
                <p className="mb-4 text-sw-body text-sw-text-secondary">{message}</p>
                <p className="mb-6 text-sw-small font-normal text-sw-text-muted">
                    Didn't get it? Check your spam folder, or call us on{' '}
                    <a href={`tel:${CONTACT_INFO.phone}`} className="font-semibold text-sw-text underline underline-offset-4">
                        {CONTACT_INFO.phone}
                    </a>.
                </p>
                <Button shape="rounded" fullWidth onClick={onBackToLogin}>
                    Back to Login
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6 text-center">
                <h2 className="mb-2 text-sw-h3 font-bold">Forgot Password?</h2>
                <p className="text-sw-body text-sw-text-secondary">
                    Enter the email you registered with and we'll send you a secure link to choose a new password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                    id="forgot-email"
                    type="email"
                    label="Email Address"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                />

                {error && (
                    <p role="alert" className="flex items-start gap-2 rounded-sw-sm bg-sw-error-bg p-3 text-sw-small font-normal text-sw-error">
                        <Icon icon={LuCircleAlert} size="xs" className="mt-0.5 shrink-0" />
                        {error}
                    </p>
                )}

                <div className="space-y-3">
                    <Button type="submit" shape="rounded" fullWidth loading={loading}>
                        {loading ? 'Sending link...' : 'Send reset link'}
                    </Button>
                    <Button type="button" variant="outline" shape="rounded" fullWidth onClick={onBackToLogin}>
                        Back to Login
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPassword;
