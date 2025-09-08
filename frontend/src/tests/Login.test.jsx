import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../components/auth/Login';

// Mock API
jest.mock('../utils/api', () => ({
    post: jest.fn()
}));

const MockedLogin = () => (
    <BrowserRouter>
        <AuthProvider>
            <Login />
        </AuthProvider>
    </BrowserRouter>
);

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form correctly', () => {
        render(<MockedLogin />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        render(<MockedLogin />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
    });

    it('shows validation error for invalid email', async () => {
        render(<MockedLogin />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
        });
    });

    it('shows validation error for short password', async () => {
        render(<MockedLogin />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: '123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
        });
    });

    it('handles successful login', async () => {
        const mockApi = require('../utils/api');
        mockApi.post.mockResolvedValueOnce({
            data: {
                success: true,
                data: {
                    token: 'mock-token',
                    refreshToken: 'mock-refresh-token',
                    user: {
                        id: '1',
                        email: 'test@example.com',
                        role: 'student'
                    }
                }
            }
        });

        render(<MockedLogin />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'SG@99student' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', {
                email: 'test@example.com',
                password: 'SG@99student'
            });
        });
    });

    it('handles login error', async () => {
        const mockApi = require('../utils/api');
        mockApi.post.mockRejectedValueOnce({
            response: {
                data: {
                    success: false,
                    message: 'Invalid credentials'
                }
            }
        });

        render(<MockedLogin />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });

    it('shows forgot password modal when clicked', async () => {
        render(<MockedLogin />);

        const forgotPasswordLink = screen.getByText(/forgot your password/i);
        fireEvent.click(forgotPasswordLink);

        await waitFor(() => {
            expect(screen.getByText(/reset password/i)).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        render(<MockedLogin />);

        const passwordInput = screen.getByLabelText(/password/i);
        const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

        expect(passwordInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });
});
