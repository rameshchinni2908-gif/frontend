import { memo } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <AppBar position="static" sx={{ mb: 2 }}>
            <Toolbar>
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    Task Manager
                </Typography>

                {isAuthenticated && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2">
                            {user?.name || 'User'}
                        </Typography>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/reports')}
                            size="small"
                        >
                            Reports
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/change-password')}
                            size="small"
                        >
                            Change Password
                        </Button>
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            size="small"
                        >
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default memo(Header);
