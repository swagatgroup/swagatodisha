import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

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

            const response = await api.post('/api/auth/login', {
                email: email,
                password: password
            });

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
            
            let errorMessage = 'Login failed. Please check your credentials.';

            // Handle different error status codes properly
            if (error.response?.status === 401) {
                errorMessage = error.response.data?.message || 'Invalid email or password. Please try again.';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Please fill in all required fields.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error during login. Please try again later.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            setIsAuthenticated(false);
            return { success: false, message: errorMessage };
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

            const { token, user, message } = response.data;

            if (!token) {
                throw new Error('No token received from server');
            }

            // Store token
            localStorage.setItem('token', token);
            setToken(token);

            // Set authorization header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            setIsAuthenticated(true);

            console.log('✅ Registration successful! User logged in:', user);
            return { success: true, user, message };

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