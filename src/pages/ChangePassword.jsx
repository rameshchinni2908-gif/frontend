import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import Header from '../components/Header';
import api, { getApiErrorMessage } from '../services/api';
import { clearAuthSession } from '../utils/authStorage';

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match.');
            return;
        }

        try {
            setLoading(true);
            const response = await api.patch('/auth/change-password', {
                currentPassword,
                newPassword
            });

            clearAuthSession();
            setMessage(response.data.msg || 'Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            navigate('/');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Container maxWidth="sm">
                <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h4">Change Password</Typography>
                    <Typography color="text.secondary">
                        Update your password and revoke older sessions automatically.
                    </Typography>

                    {message && <Alert severity="success">{message}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        disabled={loading}
                        fullWidth
                    />

                    <TextField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        disabled={loading}
                        fullWidth
                    />

                    <TextField
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        disabled={loading}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    >
                        {loading ? 'Updating...' : 'Change Password'}
                    </Button>
                </Box>
            </Container>
        </>
    );
}

export default ChangePassword;