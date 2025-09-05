import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const LoginDebug = () => {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password123');
    const [debugInfo, setDebugInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const testBackendConnection = async () => {
        setLoading(true);
        setDebugInfo('Testing backend connection...\n');

        try {
            // Test 1: Basic connectivity
            const response = await api.get('/');
            setDebugInfo(prev => prev + `✅ Backend connected: ${response.data.message}\n`);
        } catch (error) {
            setDebugInfo(prev => prev + `❌ Backend connection failed: ${error.message}\n`);
            setLoading(false);
            return;
        }

        try {
            // Test 2: Login endpoint
            setDebugInfo(prev => prev + 'Testing login endpoint...\n');
            const loginResponse = await api.post('/api/auth/login', { email, password });
            setDebugInfo(prev => prev + `✅ Login response: ${JSON.stringify(loginResponse.data, null, 2)}\n`);
        } catch (error) {
            setDebugInfo(prev => prev + `❌ Login failed: ${error.response?.data?.message || error.message}\n`);
        }

        try {
            // Test 3: Auth context login
            setDebugInfo(prev => prev + 'Testing AuthContext login...\n');
            const result = await login(email, password);
            setDebugInfo(prev => prev + `✅ AuthContext result: ${JSON.stringify(result, null, 2)}\n`);
        } catch (error) {
            setDebugInfo(prev => prev + `❌ AuthContext login failed: ${error.message}\n`);
        }

        setLoading(false);
    };

    const clearDebug = () => {
        setDebugInfo('');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Login Debug Tool</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <div className="mt-4 space-x-4">
                        <button
                            onClick={testBackendConnection}
                            disabled={loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test Login Flow'}
                        </button>
                        <button
                            onClick={clearDebug}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Clear Debug
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Debug Output</h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                        {debugInfo || 'Click "Test Login Flow" to start debugging...'}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default LoginDebug;