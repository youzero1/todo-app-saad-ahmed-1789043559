import { useEffect, useRef } from 'react';
import { formatDueLabel } from '@/lib/dates';
import { getPermission, notify } from '@/lib/notifications';
import type { Task } from '@/types/task';

/** setTimeout overflows past ~24.8 days, so long horizons re-arm in chunks. */
const MAX_DELAY = 21_600_000; // 6 hours

interface PendingReminder {
  task: Task;
  fireAt: number;
}

export function getPendingReminders(tasks: Task[]): PendingReminder[] {
  const pending: PendingReminder[] = [];
  for (const task of tasks) {
    if (task.completed || !task.dueAt) continue;
    if (task.reminderMinutesBefore === null) continue;
    if (task.reminderFiredAt !== null) continue;
    const due = new Date(task.dueAt).getTime();
    if (Number.isNaN(due)) continue;
    pending.push({ task, fireAt: due - task.reminderMinutesBefore * 60_000 });
  }
  return pending.sort((a, b) => a.fireAt - b.fireAt);
}

export interface ReminderDelivery {
  pushToast: (message: string) => void;
  revealPermissionBanner: () => void;
}

/**
 * Single rolling timer for the earliest pending fire time. Reminders whose time
 * already passed while the app was closed fire once on mount as "missed".
 */
export function useReminders(
  tasks: Task[],
  editTask: (id: string, patch: Partial<Task>) => void,
  delivery: ReminderDelivery,
): void {
  const deliveryRef = useRef(delivery);
  deliveryRef.current = delivery;

  const editRef = useRef(editTask);
  editRef.current = editTask;

  // Tracks the first pass so past-due reminders are labelled as missed.
  const mountedOnce = useRef(false);

  useEffect(() => {
    let timer: number | undefined;
    let cancelled = false;

    const deliver = (task: Task, missed: boolean) => {
      const now = new Date();
      const dueLabel = formatDueLabel(task.dueAt, now);
      const heading = missed ? 'Missed reminder' : 'Reminder';
      const permission = getPermission();

      if (permission === 'granted') {
        const posted = notify(`${heading}: ${task.title}`, dueLabel || 'Due now');
        if (!posted) {
          deliveryRef.current.pushToast(`${heading}: ${task.title}${dueLabel ? ` · ${dueLabel}` : ''}`);
        }
      } else {
        deliveryRef.current.pushToast(
          `${heading}: ${task.title}${dueLabel ? ` · ${dueLabel}` : ''}`,
        );
        if (permission === 'default') {
          deliveryRef.current.revealPermissionBanner();
        }
      }

      // Stamp so it persists and can never re-fire for this schedule.
      editRef.current(task.id, { reminderFiredAt: now.toISOString() });
    };

    const arm = () => {
      if (cancelled) return;
      const pending = getPendingReminders(tasks);
      if (pending.length === 0) return;

      const now = Date.now();
      const due = pending.filter((p) => p.fireAt <= now);

      if (due.length > 0) {
        const missed = !mountedOnce.current;
        for (const p of due) deliver(p.task, missed);
        // editTask changes `tasks`, which re-runs this effect and re-arms.
        return;
      }

      const delay = Math.min(pending[0].fireAt - now, MAX_DELAY);
      timer = window.setTimeout(arm, Math.max(delay, 0));
    };

    arm();
    mountedOnce.current = true;

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [tasks]);
}
