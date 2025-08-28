import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginDebug = () => {
    const { user, loading, token, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleTestNavigation = (path) => {
        console.log(`Attempting to navigate to: ${path}`);
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">🔍 Login Debug Panel</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Authentication State */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">🔐 Authentication State</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                            <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}</p>
                            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
                        </div>
                    </div>

                    {/* Current Location */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">📍 Current Location</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Pathname:</strong> {location.pathname}</p>
                            <p><strong>Search:</strong> {location.search}</p>
                            <p><strong>Hash:</strong> {location.hash}</p>
                        </div>
                    </div>

                    {/* Test Navigation */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">🧪 Test Navigation</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleTestNavigation('/dashboard/student')}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Test Student Dashboard
                            </button>
                            <button
                                onClick={() => handleTestNavigation('/dashboard/agent')}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Test Agent Dashboard
                            </button>
                            <button
                                onClick={() => handleTestNavigation('/dashboard/staff')}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                                Test Staff Dashboard
                            </button>
                            <button
                                onClick={() => handleTestNavigation('/dashboard/admin')}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Test Admin Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Local Storage */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">💾 Local Storage</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Token:</strong> {localStorage.getItem('token') || 'None'}</p>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    window.location.reload();
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                                Clear Token & Reload
                            </button>
                        </div>
                    </div>
                </div>

                {/* Console Instructions */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">📋 Debug Instructions:</h3>
                    <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                        <li>Open browser console (F12)</li>
                        <li>Try to login with valid credentials</li>
                        <li>Watch for console logs showing the login process</li>
                        <li>Check if user state is properly set</li>
                        <li>Verify navigation attempts</li>
                        <li>Look for any error messages</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default LoginDebug;
