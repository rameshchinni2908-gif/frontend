import { useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Box } from '@mui/material';
import { addTask } from '../store/tasksSlice';

function TaskForm({ onAddTask }) {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const addTaskHandler = onAddTask || ((taskTitle) => dispatch(addTask(taskTitle)));

    const createTask = async () => {
        if (!title.trim()) {
            return;
        }

        setLoading(true);
        try {
            await addTaskHandler(title);
            setTitle('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
                placeholder="New task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTask()}
                disabled={loading}
                size="large"
                sx={{ flex: 1 }}
            />
            <Button
                variant="contained"
                onClick={createTask}
                disabled={loading || !title.trim()}
            >
                Add Task
            </Button>
        </Box>
    );
}

export default memo(TaskForm);