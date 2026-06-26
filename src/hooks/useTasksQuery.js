import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { getApiError } from '../services/api';

export const DEFAULT_TASK_FILTERS = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc',
    status: '',
    search: '',
    from: '',
    to: ''
};

const normalizeTaskListResponse = (payload) => {
    if (Array.isArray(payload)) {
        return {
            tasks: payload,
            pagination: {
                page: 1,
                limit: payload.length,
                total: payload.length,
                totalPages: 1
            }
        };
    }

    return {
        tasks: payload.data || [],
        pagination: {
            page: payload.page || 1,
            limit: payload.limit || 10,
            total: payload.total || 0,
            totalPages: payload.totalPages || 0
        }
    };
};

export const getTaskQueryKey = (filters) => ['tasks', filters];

export function useTasksQuery(filters) {
    return useQuery({
        queryKey: getTaskQueryKey(filters),
        queryFn: async () => {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
            );

            const response = await api.get('/tasks', { params });
            return normalizeTaskListResponse(response.data);
        },
        placeholderData: (previousData) => previousData
    });
}

export function useAddTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (title) => {
            const response = await api.post('/tasks', { title });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });
}

export function useUpdateTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }) => {
            const response = await api.put(`/tasks/${id}`, updates);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });
}

export function useDeleteTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/tasks/${id}`);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });
}

export const toApiErrorState = (error) => {
    if (!error) {
        return {
            error: null,
            errorCode: null
        };
    }

    const apiError = getApiError(error);

    return {
        error: apiError.message,
        errorCode: apiError.code
    };
};