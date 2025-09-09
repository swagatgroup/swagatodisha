import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { handleAPIError } from '../utils/apiErrorHandler';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    // Set default headers when token changes
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
        } else {
            delete api.defaults.headers.common['Authorization'];
            setIsAuthenticated(false);
        }
    }, [token]);

    // Check authentication status on load
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/api/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data.user);
                        setIsAuthenticated(true);
                    } else {
                        // Token is invalid
                        localStorage.removeItem('token');
                        setToken(null);
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            console.log('AuthContext login called with:', { email, password: password ? '[PRESENT]' : '[MISSING]' });

            // Add retry logic for network issues
            let response;
            let retryCount = 0;
            const maxRetries = 3;

            while (retryCount < maxRetries) {
                try {
                    response = await api.post('/api/auth/login', {
                        email: email,
                        password: password
                    });
                    break; // Success, exit retry loop
                } catch (error) {
                    retryCount++;
                    if (retryCount >= maxRetries || (error.response && error.response.status !== 500)) {
                        throw error; // Don't retry for client errors or after max retries
                    }
                    console.log(`Login attempt ${retryCount} failed, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
                }
            }

            console.log('Login response received:', response.data);

            if (response.data.success) {
                const { token, user } = response.data;

                // Store token
                localStorage.setItem('token', token);
                setToken(token);

                // Set authorization header
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                setUser(user);
                setIsAuthenticated(true);

                return { success: true, user };
            } else {
                throw new Error(response.data.message || 'Login failed');
            }

        } catch (error) {
            console.error('Login failed:', error);

            // Use enhanced error handling
            const errorInfo = handleAPIError(error, false);

            setError(errorInfo.message);
            setIsAuthenticated(false);
            return { success: false, message: errorInfo.message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            console.log('=== FRONTEND REGISTRATION START ===');
            console.log('Registration data being sent:', {
                ...userData,
                password: '[REDACTED]'
            });

            const response = await api.post('/api/auth/register', {
                fullName: userData.fullName,
                email: userData.email,
                password: userData.password,
                phoneNumber: userData.phoneNumber,
                guardianName: userData.guardianName
            });

            console.log('Registration response received:', response.status);
            console.log('Response data:', response.data);

            const { user, message } = response.data;

            // ✅ FIXED: Do NOT store the token or auto-login after registration
            // The user should manually log in after registration
            console.log('✅ Registration successful! User created but not logged in:', user);
            return {
                success: true,
                user,
                message: message || 'Registration successful! Please log in with your credentials.'
            };

        } catch (error) {
            console.error('Registration failed:', error);

            let errorMessage = 'Registration failed. Please try again.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 409) {
                errorMessage = 'User already exists with this email or phone number.';
            } else if (error.response?.status === 400) {
                // Handle validation errors
                if (error.response.data?.errors) {
                    const validationErrors = error.response.data.errors.map(err => err.message).join(', ');
                    errorMessage = `Please fix the following: ${validationErrors}`;
                } else {
                    errorMessage = 'Please fill in all required fields correctly.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            setIsAuthenticated(false);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};