import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Container, Link, TextField, Typography } from '@mui/material';
import api, { getApiErrorMessage } from '../services/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setMessage('');

        try {
            setLoading(true);
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data.msg || 'If an account exists, a reset link has been sent.');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                <Typography variant="h4">Forgot Password</Typography>
                <Typography color="text.secondary">
                    Enter your email and we will send you a reset link if the account exists.
                </Typography>

                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    fullWidth
                />

                <Button variant="contained" onClick={handleSubmit} disabled={loading || !email.trim()}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <Link component={RouterLink} to="/">
                    Back to Login
                </Link>
            </Box>
        </Container>
    );
}

export default ForgotPassword;