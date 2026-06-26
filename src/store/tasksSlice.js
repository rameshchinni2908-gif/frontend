import { createSlice } from '@reduxjs/toolkit';
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

const initialState = {
    tasks: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    },
    query: DEFAULT_QUERY,
    loading: false,
    error: null,
    errorCode: null
};

const hasQueryChanged = (currentQuery, nextQuery) => (
    Object.keys(nextQuery).some((key) => currentQuery[key] !== nextQuery[key])
);

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        requestStarted: (state) => {
            state.loading = true;
            state.error = null;
            state.errorCode = null;
        },
        requestFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
            state.errorCode = action.payload.code;
        },
        setQuery: (state, action) => {
            state.query = action.payload;
        },
        loadSucceeded: (state, action) => {
            state.loading = false;
            state.tasks = action.payload.tasks;
            state.pagination = action.payload.pagination;
        },
        taskAddedOptimistic: (state, action) => {
            state.tasks.unshift(action.payload);
            state.pagination.total += 1;
        },
        taskReplaced: (state, action) => {
            state.tasks = state.tasks.map((task) => (
                task._id === action.payload.tempId
                    ? action.payload.createdTask
                    : task
            ));
        },
        taskRemovedById: (state, action) => {
            const before = state.tasks.length;
            state.tasks = state.tasks.filter((task) => task._id !== action.payload);
            if (state.tasks.length < before) {
                state.pagination.total = Math.max(state.pagination.total - 1, 0);
            }
        },
        tasksRestored: (state, action) => {
            state.tasks = action.payload.tasks;
            state.pagination = action.payload.pagination;
        },
        taskUpdatedOptimistic: (state, action) => {
            const { id, updates } = action.payload;
            state.tasks = state.tasks.map((task) => (
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
            ));
        },
        taskReplacedById: (state, action) => {
            const { id, updatedTask } = action.payload;
            state.tasks = state.tasks.map((task) => (task._id === id ? updatedTask : task));
        }
    }
});

export const {
    requestStarted,
    requestFailed,
    setQuery,
    loadSucceeded,
    taskAddedOptimistic,
    taskReplaced,
    taskRemovedById,
    tasksRestored,
    taskUpdatedOptimistic,
    taskReplacedById
} = tasksSlice.actions;

export const loadTasks = (overrides = {}) => async (dispatch, getState) => {
    const { query } = getState().tasks;
    const nextQuery = {
        ...query,
        ...overrides
    };

    if (hasQueryChanged(query, nextQuery)) {
        dispatch(setQuery(nextQuery));
    }

    dispatch(requestStarted());

    try {
        const params = Object.fromEntries(
            Object.entries(nextQuery).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        );

        const response = await api.get('/tasks', { params });
        const payload = response.data;

        if (Array.isArray(payload)) {
            dispatch(loadSucceeded({
                tasks: payload,
                pagination: {
                    page: 1,
                    limit: payload.length,
                    total: payload.length,
                    totalPages: 1
                }
            }));
            return;
        }

        dispatch(loadSucceeded({
            tasks: payload.data || [],
            pagination: {
                page: payload.page || 1,
                limit: payload.limit || 10,
                total: payload.total || 0,
                totalPages: payload.totalPages || 0
            }
        }));
    } catch (error) {
        const apiError = getApiError(error);
        dispatch(requestFailed(apiError));
    }
};

export const addTask = (title) => async (dispatch) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
        _id: tempId,
        title,
        completed: false,
        status: 'Pending'
    };

    dispatch(taskAddedOptimistic(optimisticTask));

    try {
        const response = await api.post('/tasks', { title });
        dispatch(taskReplaced({
            tempId,
            createdTask: response.data
        }));
    } catch (error) {
        dispatch(taskRemovedById(tempId));
        dispatch(requestFailed(getApiError(error)));
    }
};

export const deleteTask = (id) => async (dispatch, getState) => {
    const stateBefore = getState().tasks;
    const snapshot = {
        tasks: stateBefore.tasks,
        pagination: stateBefore.pagination
    };

    dispatch(taskRemovedById(id));

    try {
        await api.delete(`/tasks/${id}`);
    } catch (error) {
        dispatch(tasksRestored(snapshot));
        dispatch(requestFailed(getApiError(error)));
    }
};

export const updateTask = (id, updates) => async (dispatch, getState) => {
    const stateBefore = getState().tasks;
    const snapshot = {
        tasks: stateBefore.tasks,
        pagination: stateBefore.pagination
    };

    dispatch(taskUpdatedOptimistic({ id, updates }));

    try {
        const response = await api.put(`/tasks/${id}`, updates);
        dispatch(taskReplacedById({
            id,
            updatedTask: response.data
        }));
    } catch (error) {
        dispatch(tasksRestored(snapshot));
        dispatch(requestFailed(getApiError(error)));
    }
};

export const setPage = (page) => loadTasks({ page });
export const setLimit = (limit) => loadTasks({ limit, page: 1 });
export const setStatus = (status) => loadTasks({ status, page: 1 });
export const setSortBy = (sortBy) => loadTasks({ sortBy });
export const setOrder = (order) => loadTasks({ order });
export const setSearch = (search) => loadTasks({ search, page: 1 });
export const setFromDate = (from) => loadTasks({ from, page: 1 });
export const setToDate = (to) => loadTasks({ to, page: 1 });

export const selectTasksState = (state) => state.tasks;

export default tasksSlice.reducer;