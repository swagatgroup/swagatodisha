import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const AuthDebug = () => {
    const { user, token, isAuthenticated } = useAuth();

    const testAPI = async () => {
        try {
            console.log('Testing API with token:', token);
            const response = await api.get('/api/student-application/my-application');
            console.log('API Response:', response.data);
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Authentication Debug</h3>

            <div className="space-y-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</p>
                </div>

                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <p><strong>Token:</strong> {token ? token.substring(0, 20) + '...' : 'No token'}</p>
                </div>

                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                </div>

                <button
                    onClick={testAPI}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Test API Call
                </button>
            </div>
        </div>
    );
};

export default AuthDebug;
