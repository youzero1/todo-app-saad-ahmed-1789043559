import { getDueBucket, isOverdue } from '@/lib/dates';
import type { DueBucket, NewTaskInput, Task, TaskFilter } from '@/types/task';

function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createTask(input: NewTaskInput): Task {
  const now = new Date().toISOString();
  return {
    id: newId(),
    title: input.title.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    dueAt: input.dueAt ?? null,
    reminderMinutesBefore: input.reminderMinutesBefore ?? null,
    reminderFiredAt: null,
  };
}

export function toggleTask(tasks: Task[], id: string): Task[] {
  const now = new Date().toISOString();
  return tasks.map((t) => {
    if (t.id !== id) return t;
    const completed = !t.completed;
    return {
      ...t,
      completed,
      completedAt: completed ? now : null,
      updatedAt: now,
      // Un-completing re-arms the reminder for the existing due time.
      reminderFiredAt: completed ? t.reminderFiredAt : null,
    };
  });
}

/**
 * Applies a patch. Moving `dueAt` to a later time, or clearing it, resets
 * `reminderFiredAt` so the reminder can fire again for the new schedule.
 */
export function updateTask(tasks: Task[], id: string, patch: Partial<Task>): Task[] {
  const now = new Date().toISOString();
  return tasks.map((t) => {
    if (t.id !== id) return t;
    const next: Task = { ...t, ...patch, id: t.id, updatedAt: now };
    if (typeof patch.title === 'string') next.title = patch.title.trim();

    const dueChanged = 'dueAt' in patch && patch.dueAt !== t.dueAt;
    const reminderChanged =
      'reminderMinutesBefore' in patch && patch.reminderMinutesBefore !== t.reminderMinutesBefore;
    const explicitStamp = 'reminderFiredAt' in patch;

    if (!explicitStamp && (dueChanged || reminderChanged)) {
      next.reminderFiredAt = null;
    }
    return next;
  });
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id);
}

function time(iso: string | null): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Dated tasks first by soonest due, then undated by newest created.
 * Completed tasks are always ordered by most recently completed.
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed && b.completed) return time(b.completedAt) - time(a.completedAt);
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueAt && b.dueAt) return time(a.dueAt) - time(b.dueAt);
    if (a.dueAt) return -1;
    if (b.dueAt) return 1;
    return time(b.createdAt) - time(a.createdAt);
  });
}

export function filterTasks(tasks: Task[], filter: TaskFilter, now: Date): Task[] {
  const active = tasks.filter((t) => !t.completed);
  switch (filter) {
    case 'all':
      return sortTasks(active);
    case 'completed':
      return sortTasks(tasks.filter((t) => t.completed));
    case 'overdue':
      return sortTasks(active.filter((t) => isOverdue(t, now)));
    case 'today':
      return sortTasks(
        active.filter((t) => {
          const b = getDueBucket(t.dueAt, now);
          return b === 'today' || b === 'overdue';
        }),
      );
    case 'upcoming':
      return sortTasks(
        active.filter((t) => {
          const b = getDueBucket(t.dueAt, now);
          return b === 'tomorrow' || b === 'upcoming';
        }),
      );
    default:
      return sortTasks(active);
  }
}

export interface BucketSection {
  bucket: DueBucket;
  label: string;
  tasks: Task[];
}

const BUCKET_ORDER: DueBucket[] = ['overdue', 'today', 'tomorrow', 'upcoming', 'none'];

const BUCKET_LABELS: Record<DueBucket, string> = {
  overdue: 'Overdue',
  today: 'Today',
  tomorrow: 'Tomorrow',
  upcoming: 'Upcoming',
  none: 'No due date',
};

export function groupTasksByBucket(tasks: Task[], now: Date): BucketSection[] {
  const sorted = sortTasks(tasks);
  return BUCKET_ORDER.map((bucket) => ({
    bucket,
    label: BUCKET_LABELS[bucket],
    tasks: sorted.filter((t) => getDueBucket(t.dueAt, now) === bucket),
  })).filter((section) => section.tasks.length > 0);
}

export function countsByFilter(tasks: Task[], now: Date): Record<TaskFilter, number> {
  return {
    all: filterTasks(tasks, 'all', now).length,
    today: filterTasks(tasks, 'today', now).length,
    upcoming: filterTasks(tasks, 'upcoming', now).length,
    overdue: filterTasks(tasks, 'overdue', now).length,
    completed: filterTasks(tasks, 'completed', now).length,
  };
}

export function dueTodayCount(tasks: Task[], now: Date): number {
  return tasks.filter(
    (t) => !t.completed && ['today', 'overdue'].includes(getDueBucket(t.dueAt, now)),
  ).length;
}
