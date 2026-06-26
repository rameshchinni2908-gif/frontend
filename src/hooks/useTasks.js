import { useState, useCallback, useMemo } from 'react';
import api, { getApiError } from '../services/api';

const DEFAULT_QUERY = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc',
    status: '',
    search: '',
    from: '',
    to: ''
};

const hasQueryChanged = (currentQuery, nextQuery) => (
    Object.keys(nextQuery).some((key) => currentQuery[key] !== nextQuery[key])
);

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [query, setQuery] = useState(DEFAULT_QUERY);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorCode, setErrorCode] = useState(null);

    const loadTasks = useCallback(async (overrides = {}) => {
        const nextQuery = {
            ...query,
            ...overrides
        };

        if (hasQueryChanged(query, nextQuery)) {
            setQuery(nextQuery);
        }
        setLoading(true);
        setError(null);
        setErrorCode(null);
        try {
            const params = Object.fromEntries(
                Object.entries(nextQuery).filter(([, value]) => value !== '' && value !== null && value !== undefined)
            );

            const res = await api.get('/tasks', { params });
            const payload = res.data;

            if (Array.isArray(payload)) {
                setTasks(payload);
                setPagination({
                    page: 1,
                    limit: payload.length,
                    total: payload.length,
                    totalPages: 1
                });
            } else {
                setTasks(payload.data || []);
                setPagination({
                    page: payload.page || 1,
                    limit: payload.limit || 10,
                    total: payload.total || 0,
                    totalPages: payload.totalPages || 0
                });
            }
        } catch (err) {
            const apiError = getApiError(err);
            setError(apiError.message);
            setErrorCode(apiError.code);
        } finally {
            setLoading(false);
        }
    }, [query]);

    const addTask = useCallback(async (title) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticTask = {
            _id: tempId,
            title,
            completed: false,
            status: 'Pending'
        };

        setError(null);
        setErrorCode(null);
        setTasks(current => [optimisticTask, ...current]);
        setPagination(current => ({
            ...current,
            total: current.total + 1
        }));

        try {
            const response = await api.post('/tasks', { title });
            setTasks(current => current.map(task => task._id === tempId ? response.data : task));
        } catch (err) {
            setTasks(current => current.filter(task => task._id !== tempId));
            setPagination(current => ({
                ...current,
                total: Math.max(current.total - 1, 0)
            }));
            const apiError = getApiError(err);
            setError(apiError.message);
            setErrorCode(apiError.code);
        }
    }, []);

    const deleteTask = useCallback(async (id) => {
        const previousTasks = tasks;
        const removedTask = tasks.find(task => task._id === id);

        setError(null);
        setErrorCode(null);
        setTasks(current => current.filter(task => task._id !== id));
        if (removedTask) {
            setPagination(current => ({
                ...current,
                total: Math.max(current.total - 1, 0)
            }));
        }

        try {
            await api.delete(`/tasks/${id}`);
        } catch (err) {
            setTasks(previousTasks);
            if (removedTask) {
                setPagination(current => ({
                    ...current,
                    total: current.total + 1
                }));
            }
            const apiError = getApiError(err);
            setError(apiError.message);
            setErrorCode(apiError.code);
        }
    }, [tasks]);

    const updateTask = useCallback(async (id, updates) => {
        const previousTasks = tasks;

        setError(null);
        setErrorCode(null);
        setTasks(current => current.map(task => (
            task._id === id
                ? {
                    ...task,
                    ...updates,
                    status: updates.completed === true
                        ? 'Completed'
                        : updates.completed === false && task.status === 'Completed'
                            ? 'Pending'
                            : task.status
                }
                : task
        )));

        try {
            const response = await api.put(`/tasks/${id}`, updates);
            setTasks(current => current.map(task => task._id === id ? response.data : task));
        } catch (err) {
            setTasks(previousTasks);
            const apiError = getApiError(err);
            setError(apiError.message);
            setErrorCode(apiError.code);
        }
    }, [tasks]);

    const setPage = useCallback((page) => {
        loadTasks({ page });
    }, [loadTasks]);

    const setLimit = useCallback((limit) => {
        loadTasks({ limit, page: 1 });
    }, [loadTasks]);

    const setStatus = useCallback((status) => {
        loadTasks({ status, page: 1 });
    }, [loadTasks]);

    const setSortBy = useCallback((sortBy) => {
        loadTasks({ sortBy });
    }, [loadTasks]);

    const setOrder = useCallback((order) => {
        loadTasks({ order });
    }, [loadTasks]);

    const setSearch = useCallback((search) => {
        loadTasks({ search, page: 1 });
    }, [loadTasks]);

    const setFromDate = useCallback((from) => {
        loadTasks({ from, page: 1 });
    }, [loadTasks]);

    const setToDate = useCallback((to) => {
        loadTasks({ to, page: 1 });
    }, [loadTasks]);

    const stats = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length
    }), [tasks]);

    return {
        tasks,
        loading,
        error,
        errorCode,
        loadTasks,
        addTask,
        deleteTask,
        updateTask,
        pagination,
        query,
        setPage,
        setLimit,
        setStatus,
        setSortBy,
        setOrder,
        setSearch,
        setFromDate,
        setToDate,
        stats
    };
}
