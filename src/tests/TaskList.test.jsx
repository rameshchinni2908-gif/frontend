import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TaskList from '../components/TaskList';
import TaskCard from '../components/TaskCard';
import tasksReducer from '../store/tasksSlice';

const renderWithProviders = (ui) => {
    const store = configureStore({
        reducer: {
            tasks: tasksReducer
        }
    });

    return render(
        <Provider store={store}>
            {ui}
        </Provider>
    );
};

describe('TaskList Component', () => {
    it('renders loading state', () => {
        render(
            <Provider store={configureStore({ reducer: { tasks: tasksReducer } })}>
                <TaskList
                    tasks={[]}
                    loading={true}
                    error={null}
                    onDelete={() => { }}
                    onUpdate={() => { }}
                />
            </Provider>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders error message', () => {
        renderWithProviders(
            <TaskList
                tasks={[]}
                loading={false}
                error="Failed to load tasks"
                onDelete={() => { }}
                onUpdate={() => { }}
            />
        );
        expect(screen.getByText(/Error: Failed to load tasks/i)).toBeInTheDocument();
    });

    it('renders empty state when no tasks', () => {
        renderWithProviders(
            <TaskList
                tasks={[]}
                loading={false}
                error={null}
                onDelete={() => { }}
                onUpdate={() => { }}
            />
        );
        expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
    });

    it('renders task list correctly', () => {
        const tasks = [
            { _id: '1', title: 'Task 1', completed: false },
            { _id: '2', title: 'Task 2', completed: true }
        ];

        renderWithProviders(
            <TaskList
                tasks={tasks}
                loading={false}
                error={null}
                onDelete={() => { }}
                onUpdate={() => { }}
            />
        );

        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', () => {
        const onDelete = vi.fn();
        const tasks = [
            { _id: '1', title: 'Task 1', completed: false }
        ];

        renderWithProviders(
            <TaskList
                tasks={tasks}
                loading={false}
                error={null}
                onDelete={onDelete}
                onUpdate={() => { }}
            />
        );

        const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
        fireEvent.click(deleteButtons[0]);

        expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('calls onUpdate when checkbox is clicked', () => {
        const onUpdate = vi.fn();
        const tasks = [
            { _id: '1', title: 'Task 1', completed: false }
        ];

        renderWithProviders(
            <TaskList
                tasks={tasks}
                loading={false}
                error={null}
                onDelete={() => { }}
                onUpdate={onUpdate}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);

        expect(onUpdate).toHaveBeenCalledWith('1', { completed: true });
    });
});

describe('TaskCard Component', () => {
    it('renders task card with title', () => {
        const task = { _id: '1', title: 'Test Task', completed: false };

        renderWithProviders(
            <TaskCard
                task={task}
                onDelete={() => { }}
                onUpdate={() => { }}
            />
        );

        expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('applies strikethrough style when completed', () => {
        const task = { _id: '1', title: 'Test Task', completed: true };

        renderWithProviders(
            <TaskCard
                task={task}
                onDelete={() => { }}
                onUpdate={() => { }}
            />
        );

        const title = screen.getByText('Test Task');
        expect(title).toHaveStyle('text-decoration: line-through');
    });

    it('calls onDelete when delete button is clicked', () => {
        const onDelete = vi.fn();
        const task = { _id: '1', title: 'Test Task', completed: false };

        renderWithProviders(
            <TaskCard
                task={task}
                onDelete={onDelete}
                onUpdate={() => { }}
            />
        );

        const deleteButton = screen.getByRole('button', { name: /Delete/i });
        fireEvent.click(deleteButton);

        expect(onDelete).toHaveBeenCalledWith('1');
    });
});
