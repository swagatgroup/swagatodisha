import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginTest = () => {
    const { login, user, token, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('rama12@gmail.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            console.log('Login successful');
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Login Test</h3>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <p><strong>Current User:</strong> {user ? user.fullName || user.email : 'Not logged in'}</p>
                <p><strong>Token:</strong> {token ? 'Present' : 'None'}</p>
                <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            </div>
        </div>
    );
};

export default LoginTest;
