import { memo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function UserProfile() {
    const { user } = useAuth();

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ p: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Profile
                    </Typography>
                    <Typography variant="body2">
                        <strong>Name:</strong> {user?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Email:</strong> {user?.email || 'Unknown'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default memo(UserProfile);
