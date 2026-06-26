import React from "react";
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary
    extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error) {
        console.log(error);
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                        gap: 2,
                        p: 2
                    }}
                >
                    <Typography variant="h5" sx={{ color: 'error.main' }}>
                        Something Went Wrong
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={this.reset}
                        sx={{ mt: 2 }}
                    >
                        Try Again
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;