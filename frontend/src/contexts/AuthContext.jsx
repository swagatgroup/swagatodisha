import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api, { setExplicitLogout } from '../utils/api';
import { handleAPIError } from '../utils/apiErrorHandler';

const AuthContext = createContext();

// ─── SINGLE SOURCE OF TRUTH: clearAuthState() ─────────────────────────────────
// Every path that ends a session (manual logout, 401, cross-tab sync) calls
// this ONE function. Auth-clearing logic is NEVER duplicated elsewhere.
export function clearAuthState() {
    console.log('🔐 clearAuthState() — wiping ALL auth data');

    // 1. localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2. sessionStorage (in case anything ever writes here)
    try { sessionStorage.removeItem('token'); } catch (_) { /* ignore */ }
    try { sessionStorage.removeItem('user'); } catch (_) { /* ignore */ }

    // 3. Axios default header (module-level singleton)
    try {
        delete api.defaults.headers.common['Authorization'];
    } catch (_) { /* ignore */ }
}

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
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // AbortController — aborts ALL in-flight requests on logout so late
    // responses can never call setUser() after the session is destroyed.
    const abortControllerRef = useRef(null);

    // Helper: reset React state (called after clearAuthState cleans storage)
    const resetReactAuthState = useCallback(() => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
    }, []);

    // ─── CROSS-TAB LOGOUT SYNC (Case 10) ───────────────────────────────────────
    // When another tab removes the 'token' key from localStorage, every other
    // tab hears it via the native 'storage' event and logs out independently.
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token' && e.newValue === null && e.oldValue !== null) {
                console.log('🔐 Cross-tab logout detected — another tab removed the token');
                resetReactAuthState();
                window.location.replace('/login-portal');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [resetReactAuthState]);

    // ─── 401 EVENT LISTENER ────────────────────────────────────────────────────
    useEffect(() => {
        const handleUnauthorized = () => {
            console.log('🔐 AuthContext — auth:unauthorized event received');
            clearAuthState();
            resetReactAuthState();
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [resetReactAuthState]);

    // ─── INITIALIZE AUTH ON MOUNT ──────────────────────────────────────────────
    useEffect(() => {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                console.log('🔐 AuthContext — init:', storedToken ? 'Token exists' : 'No token');

                if (!storedToken) {
                    setIsAuthenticated(false);
                    return;
                }

                // Set token and headers immediately
                setToken(storedToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                // Recover user from cache instantly (prevents flash)
                try {
                    const cachedUser = localStorage.getItem('user');
                    if (cachedUser) {
                        setUser(JSON.parse(cachedUser));
                        setIsAuthenticated(true);
                    }
                } catch (e) {
                    console.warn('Failed to parse cached user', e);
                }

                // Verify token with backend
                try {
                    const response = await api.get('/api/auth/me', {
                        signal: controller.signal
                    });

                    // Guard: if we were aborted (logout happened during this request), bail
                    if (controller.signal.aborted) return;

                    if (response.data.success) {
                        const fetchedUser = response.data.data.user;
                        setUser(fetchedUser);
                        localStorage.setItem('user', JSON.stringify(fetchedUser));
                        setIsAuthenticated(true);
                    } else {
                        clearAuthState();
                        resetReactAuthState();
                    }
                } catch (error) {
                    if (error.name === 'AbortError' || error.name === 'CanceledError') return;
                    if (controller.signal.aborted) return;

                    console.error('🔐 Auth check failed:', error.response?.status || error.message);

                    if (error.response?.status === 401 || error.response?.status === 403) {
                        clearAuthState();
                        resetReactAuthState();
                    } else {
                        // Network error — keep cached auth to avoid spurious logout
                        setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                console.warn('🔐 Error reading token:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        return () => {
            controller.abort();
        };
    }, [resetReactAuthState]);

    // Sync axios header when React token state changes
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // ─── LOGIN ──────────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            setExplicitLogout(false); // Reset the logout sentinel on login

            // Create a fresh AbortController for the new session
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            let response;
            let retryCount = 0;
            const maxRetries = 3;

            while (retryCount < maxRetries) {
                try {
                    response = await api.post('/api/auth/login', {
                        email: email,
                        password: password
                    });
                    break;
                } catch (error) {
                    retryCount++;
                    if (retryCount >= maxRetries || (error.response && error.response.status !== 500)) {
                        throw error;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }

            if (response.data.success) {
                const { token, user } = response.data;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setToken(token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(user);
                setIsAuthenticated(true);

                return { success: true, user };
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            const errorInfo = handleAPIError(error, false);
            setError(errorInfo.message);
            setIsAuthenticated(false);
            return { success: false, message: errorInfo.message };
        } finally {
            setLoading(false);
        }
    };

    // ─── REGISTER ───────────────────────────────────────────────────────────────
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/api/auth/register', {
                fullName: userData.fullName,
                email: userData.email,
                password: userData.password,
                phoneNumber: userData.phoneNumber,
                role: userData.role || 'student'
            });

            const { user, message } = response.data;

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

    // ─── LOGOUT ─────────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        try {
            console.log('💥 AuthContext logout() called');
            setExplicitLogout(true);

            // Abort all in-flight requests so late responses can't re-set user
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            clearAuthState();
            resetReactAuthState();
            console.log('💥 AuthContext logout() finished');
        } catch (error) {
            console.error('💥 AuthContext logout() failed', error);
        }
    }, [resetReactAuthState]);

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
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