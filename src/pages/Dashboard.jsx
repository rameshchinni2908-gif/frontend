import {
    useEffect,
    Suspense
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import { loadTasks, selectTasksState } from '../store/tasksSlice';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import UserProfile from '../components/UserProfile';
import Header from '../components/Header';

function Dashboard() {
    const dispatch = useDispatch();
    const { error, errorCode } = useSelector(selectTasksState);

    useEffect(() => {
        dispatch(loadTasks());
    }, [dispatch]);

    return (
        <>
            <Header />
            <Container maxWidth="md" sx={{ py: 3 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ mb: 2 }}>
                        Tasks
                    </Typography>
                    <UserProfile />
                </Box>

                <TaskForm />

                {errorCode && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {errorCode}: {error}
                    </Typography>
                )}

                <Suspense fallback={<CircularProgress />}>
                    <TaskList />
                </Suspense>
            </Container>
        </>
    );
}

export default Dashboard;