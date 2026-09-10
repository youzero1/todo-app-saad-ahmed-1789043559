import type { DueBucket, Task } from '@/types/task';

const MS_PER_DAY = 86_400_000;

export function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function endOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Whole calendar days from `now` to `target` (negative = in the past). */
export function dayDiff(target: Date, now: Date): number {
  return Math.round((startOfDay(target).getTime() - startOfDay(now).getTime()) / MS_PER_DAY);
}

export function getDueBucket(dueAt: string | null, now: Date): DueBucket {
  if (!dueAt) return 'none';
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return 'none';
  if (due.getTime() < now.getTime()) return 'overdue';
  const diff = dayDiff(due, now);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'tomorrow';
  return 'upcoming';
}

export function isOverdue(task: Task, now: Date): boolean {
  if (task.completed || !task.dueAt) return false;
  const due = new Date(task.dueAt);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < now.getTime();
}

function timeLabel(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function dateLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatDueLabel(dueAt: string | null, now: Date): string {
  if (!dueAt) return '';
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return '';
  const bucket = getDueBucket(dueAt, now);
  switch (bucket) {
    case 'overdue':
      return isSameDay(due, now)
        ? `Overdue · ${timeLabel(due)}`
        : `Overdue · ${dateLabel(due)}`;
    case 'today':
      return `Today, ${timeLabel(due)}`;
    case 'tomorrow':
      return `Tomorrow, ${timeLabel(due)}`;
    default:
      return `${dateLabel(due)}, ${timeLabel(due)}`;
  }
}

/** Splits an ISO timestamp into the value pair the native date/time inputs want. */
export function toInputParts(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** Combines native date/time input values into an ISO timestamp (local time). */
export function fromInputParts(date: string, time: string): string | null {
  if (!date) return null;
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = time ? time.split(':').map(Number) : [9, 0];
  const composed = new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
  if (Number.isNaN(composed.getTime())) return null;
  return composed.toISOString();
}

export function todayEvening(now: Date): string {
  const d = new Date(now);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
}

export function tomorrowMorning(now: Date): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export function nextWeek(now: Date): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 7);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}
