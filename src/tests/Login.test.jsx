import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import * as apiModule from '../services/api';

vi.mock('../services/api', async () => {
    const actual = await vi.importActual('../services/api');

    return {
        ...actual,
        default: {
            post: vi.fn()
        }
    };
});

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <Login />
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', () => {
        renderLogin();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    it('shows error when email or password is missing', async () => {
        renderLogin();
        const loginButton = screen.getByRole('button', { name: /Login/i });

        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText(/Email and password are required/i)).toBeInTheDocument();
        });
    });

    it('calls login API with correct credentials', async () => {
        const mockPost = vi.fn().mockResolvedValue({
            data: {
                user: { name: 'John', email: 'john@test.com' },
                token: 'test-token'
            }
        });

        apiModule.default.post = mockPost;

        renderLogin();

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                email: 'john@test.com',
                password: 'password123'
            });
        });
    });

    it('shows loading state during login', async () => {
        const mockPost = vi.fn().mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 1000))
        );

        apiModule.default.post = mockPost;

        renderLogin();

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(loginButton);

        expect(screen.getByRole('button', { name: /Logging in/i })).toBeInTheDocument();
    });

    it('displays error message on failed login', async () => {
        const mockPost = vi.fn().mockRejectedValue({
            response: { data: { msg: 'Invalid credentials' } }
        });

        apiModule.default.post = mockPost;

        renderLogin();

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrong' } });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });
    });
});
