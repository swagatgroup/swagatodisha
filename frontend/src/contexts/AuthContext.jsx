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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Set default headers when token changes
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check authentication status on load
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/api/auth/me');
                    setUser(response.data.data.user);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/api/auth/login', {
                email: credentials.email,
                password: credentials.password
            });

            const { token, user } = response.data;

            // Store token
            localStorage.setItem('token', token);
            setToken(token);

            // Set authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            setIsAuthenticated(true);

            return { success: true, user };

        } catch (error) {
            console.error('Login failed:', error);

            let errorMessage = 'Login failed. Please check your credentials.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            console.log('=== FRONTEND REGISTRATION START ===');
            console.log('Registration data being sent:', userData);

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
                errorMessage = 'Please fill in all required fields correctly.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
