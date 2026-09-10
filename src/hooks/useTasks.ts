import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createTask,
  removeTask,
  toggleTask as toggleIn,
  updateTask as updateIn,
} from '@/lib/tasks';
import { loadTasks, saveTasks } from '@/lib/storage';
import type { NewTaskInput, Task } from '@/types/task';

export interface UseTasks {
  tasks: Task[];
  loading: boolean;
  addTask: (input: NewTaskInput) => Task | null;
  editTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
  replaceAll: (tasks: Task[]) => void;
}

/** Single owner of task state. No component touches localStorage directly. */
export function useTasks(): UseTasks {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  // True only for the very first paint, so the UI avoids an empty-state flash.
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    setLoading(false);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((input: NewTaskInput): Task | null => {
    if (!input.title.trim()) return null;
    const task = createTask(input);
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const editTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => updateIn(prev, id, patch));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => toggleIn(prev, id));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => removeTask(prev, id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  const replaceAll = useCallback((next: Task[]) => setTasks(next), []);

  return { tasks, loading, addTask, editTask, toggleTask, deleteTask, clearCompleted, replaceAll };
}
