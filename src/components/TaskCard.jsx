import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardActions, Typography, Button, Checkbox, Box } from '@mui/material';
import { deleteTask, updateTask } from '../store/tasksSlice';

function TaskCard({ task, onDelete, onUpdate }) {
    const dispatch = useDispatch();
    const deleteHandler = onDelete || ((id) => dispatch(deleteTask(id)));
    const updateHandler = onUpdate || ((id, updates) => dispatch(updateTask(id, updates)));

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                        checked={task.completed || false}
                        onChange={(e) => updateHandler(task._id, { completed: e.target.checked })}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary'
                        }}
                    >
                        {task.title}
                    </Typography>
                </Box>
            </CardContent>
            <CardActions>
                <Button
                    size="small"
                    color="error"
                    onClick={() => deleteHandler(task._id)}
                >
                    Delete
                </Button>
            </CardActions>
        </Card>
    );
}

export default memo(TaskCard);
