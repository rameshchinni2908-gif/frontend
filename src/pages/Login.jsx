import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Box, Typography, Alert, Link } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api, { getApiErrorMessage } from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/login', {
                email,
                password
            });

            login(res.data.user, res.data.accessToken || res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2
                }}
            >
                <Typography variant="h4" sx={{ mb: 3 }}>
                    Task Manager
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    fullWidth
                    disabled={loading}
                />

                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    fullWidth
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </Button>

                <Link component={RouterLink} to="/forgot-password" sx={{ alignSelf: 'flex-end' }}>
                    Forgot password?
                </Link>
            </Box>
        </Container>
    );
}

export default Login;