import React, { useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Container, Link, TextField, Typography } from '@mui/material';
import api, { getApiErrorMessage } from '../services/api';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setMessage('');

        if (!token) {
            setError('Reset token is missing. Use the link from your email.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword
            });
            setMessage(response.data.msg || 'Password reset successful');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                <Typography variant="h4">Reset Password</Typography>
                <Typography color="text.secondary">
                    Set a new password for your account.
                </Typography>

                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={loading}
                    fullWidth
                />

                <TextField
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={loading}
                    fullWidth
                />

                <Button variant="contained" onClick={handleSubmit} disabled={loading || !newPassword || !confirmPassword}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </Button>

                <Link component={RouterLink} to="/">
                    Back to Login
                </Link>
            </Box>
        </Container>
    );
}

export default ResetPassword;