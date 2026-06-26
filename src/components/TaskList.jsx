import React, { memo } from 'react';
import { useMemo, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table';
import {
    DEFAULT_TASK_FILTERS,
    toApiErrorState,
    useDeleteTaskMutation,
    useTasksQuery,
    useUpdateTaskMutation
} from '../hooks/useTasksQuery';

function TaskList({
    tasks,
    loading,
    error,
    onDelete,
    onUpdate,
    pagination,
    filters,
    onSearchChange = () => { },
    onStatusChange = () => { },
    onSortByChange = () => { },
    onOrderChange = () => { },
    onLimitChange = () => { },
    onFromDateChange = () => { },
    onToDateChange = () => { },
    onPageChange = () => { }
}) {
    const [internalFilters, setInternalFilters] = useState(filters || DEFAULT_TASK_FILTERS);
    const taskQuery = useTasksQuery(internalFilters);
    const updateTaskMutation = useUpdateTaskMutation();
    const deleteTaskMutation = useDeleteTaskMutation();
    const apiErrorState = toApiErrorState(taskQuery.error);
    const resolvedTasks = tasks ?? taskQuery.data?.tasks ?? [];
    const resolvedLoading = loading ?? taskQuery.isLoading;
    const resolvedError = error ?? apiErrorState.error;
    const resolvedPagination = pagination ?? taskQuery.data?.pagination ?? { page: 1, totalPages: 0, total: 0, limit: 10 };
    const resolvedFilters = filters ?? internalFilters;

    const updateFilters = (changes, externalHandler) => {
        if (!filters) {
            setInternalFilters((current) => ({
                ...current,
                ...changes
            }));
        }

        externalHandler?.(Object.values(changes)[0]);
    };

    const deleteHandler = onDelete || ((id) => deleteTaskMutation.mutateAsync(id));
    const updateHandler = onUpdate || ((id, updates) => updateTaskMutation.mutateAsync({ id, updates }));
    const pageChangeHandler = onPageChange || ((page) => updateFilters({ page }, onPageChange));
    const limitChangeHandler = onLimitChange || ((limit) => updateFilters({ limit, page: 1 }, onLimitChange));
    const statusChangeHandler = onStatusChange || ((status) => updateFilters({ status, page: 1 }, onStatusChange));
    const sortByChangeHandler = onSortByChange || ((sortByValue) => updateFilters({ sortBy: sortByValue }, onSortByChange));
    const orderChangeHandler = onOrderChange || ((orderValue) => updateFilters({ order: orderValue }, onOrderChange));
    const searchChangeHandler = onSearchChange || ((searchValue) => updateFilters({ search: searchValue, page: 1 }, onSearchChange));
    const fromDateChangeHandler = onFromDateChange || ((fromValue) => updateFilters({ from: fromValue, page: 1 }, onFromDateChange));
    const toDateChangeHandler = onToDateChange || ((toValue) => updateFilters({ to: toValue, page: 1 }, onToDateChange));

    const columnHelper = createColumnHelper();
    const columns = useMemo(() => ([
        columnHelper.display({
            id: 'completed',
            header: 'Done',
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.completed || false}
                    onChange={(event) => updateHandler(row.original._id, { completed: event.target.checked })}
                />
            )
        }),
        columnHelper.accessor('title', {
            header: 'Title',
            cell: (info) => {
                const task = info.row.original;

                return (
                    <Typography
                        variant="body1"
                        sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary',
                            fontWeight: 500
                        }}
                    >
                        {info.getValue()}
                    </Typography>
                );
            }
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => info.getValue() || (info.row.original.completed ? 'Completed' : 'Pending')
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button
                    size="small"
                    color="error"
                    onClick={() => deleteHandler(row.original._id)}
                >
                    Delete
                </Button>
            )
        })
    ]), [deleteHandler, updateHandler]);

    const table = useReactTable({
        data: resolvedTasks,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                    label="Search"
                    value={resolvedFilters.search || ''}
                    onChange={(event) => searchChangeHandler(event.target.value)}
                    size="small"
                />
                <TextField
                    label="From"
                    type="date"
                    value={resolvedFilters.from || ''}
                    onChange={(event) => fromDateChangeHandler(event.target.value ? new Date(event.target.value).toISOString() : '')}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="To"
                    type="date"
                    value={resolvedFilters.to || ''}
                    onChange={(event) => toDateChangeHandler(event.target.value ? new Date(`${event.target.value}T23:59:59.999Z`).toISOString() : '')}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        label="Status"
                        value={resolvedFilters.status || ''}
                        onChange={(event) => statusChangeHandler(event.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        label="Sort By"
                        value={resolvedFilters.sortBy || 'createdAt'}
                        onChange={(event) => sortByChangeHandler(event.target.value)}
                    >
                        <MenuItem value="createdAt">Created</MenuItem>
                        <MenuItem value="updatedAt">Updated</MenuItem>
                        <MenuItem value="title">Title</MenuItem>
                        <MenuItem value="status">Status</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Order</InputLabel>
                    <Select
                        label="Order"
                        value={resolvedFilters.order || 'desc'}
                        onChange={(event) => orderChangeHandler(event.target.value)}
                    >
                        <MenuItem value="desc">Desc</MenuItem>
                        <MenuItem value="asc">Asc</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Page Size</InputLabel>
                    <Select
                        label="Page Size"
                        value={resolvedFilters.limit || 10}
                        onChange={(event) => limitChangeHandler(Number(event.target.value))}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {resolvedLoading && <CircularProgress sx={{ mt: 2 }} />}

            {!resolvedLoading && resolvedError && (
                <Typography color="error">Error: {resolvedError}</Typography>
            )}

            {!resolvedLoading && !resolvedError && resolvedTasks.length === 0 && (
                <Typography sx={{ mt: 2, textAlign: 'center' }}>No tasks yet</Typography>
            )}

            {!resolvedLoading && !resolvedError && resolvedTasks.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableCell key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHead>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} hover>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {!resolvedLoading && !resolvedError && resolvedTasks.length > 0 && (
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Page {resolvedPagination.page} of {Math.max(resolvedPagination.totalPages, 1)} • {resolvedPagination.total} total tasks
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => pageChangeHandler(Math.max(resolvedPagination.page - 1, 1))}
                            disabled={resolvedPagination.page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => pageChangeHandler(resolvedPagination.page + 1)}
                            disabled={resolvedPagination.page >= Math.max(resolvedPagination.totalPages, 1)}
                        >
                            Next
                        </Button>
                    </Stack>
                </Stack>
            )}
        </Box>
    );
}

export default memo(TaskList);
