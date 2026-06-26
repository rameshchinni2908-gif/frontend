import { useEffect, useMemo } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Grid } from '@mui/material';
import { useTasks } from '../hooks/useTasks';
import Header from '../components/Header';

function Reports() {
    const { tasks, loadTasks, loading } = useTasks();

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const tasksByTitle = useMemo(() => {
        return tasks.reduce((acc, task) => {
            const first = task.title?.charAt(0).toUpperCase() || '?';
            acc[first] = (acc[first] || 0) + 1;
            return acc;
        }, {});
    }, [tasks]);

    const completionPercentage = useMemo(() => {
        if (tasks.length === 0) return 0;
        return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
    }, [tasks]);

    return (
        <>
            <Header />
            <Box sx={{ p: 2 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>
                    Task Reports
                </Typography>

                {loading ? (
                    <Typography>Loading reports...</Typography>
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Tasks
                                    </Typography>
                                    <Typography variant="h5">
                                        {tasks.length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Completion Rate
                                    </Typography>
                                    <Typography variant="h5" sx={{ mb: 1 }}>
                                        {completionPercentage}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={completionPercentage}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Tasks by First Letter
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        {Object.entries(tasksByTitle).map(([letter, count]) => (
                                            <Box key={letter} sx={{ textAlign: 'center' }}>
                                                <Typography variant="body2" color="textSecondary">
                                                    {letter}
                                                </Typography>
                                                <Typography variant="h6">
                                                    {count}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </>
    );
}

export default Reports;
