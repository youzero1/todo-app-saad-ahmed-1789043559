import { formatDueLabel, getDueBucket } from '@/lib/dates';

interface DueBadgeProps {
  dueAt: string | null;
  now: Date;
  hasReminder: boolean;
  completed: boolean;
}

export function DueBadge({ dueAt, now, hasReminder, completed }: DueBadgeProps) {
  if (!dueAt) return null;
  const bucket = getDueBucket(dueAt, now);
  const label = formatDueLabel(dueAt, now);
  if (!label) return null;

  const tone = completed
    ? 'text-muted'
    : bucket === 'overdue'
      ? 'text-danger font-medium'
      : bucket === 'today'
        ? 'text-accent font-medium'
        : 'text-muted';

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${tone}`}>
      {label}
      {hasReminder && !completed && (
        <span aria-label="Reminder set" title="Reminder set" role="img" className="text-[11px]">
          🔔
        </span>
      )}
    </span>
  );
}
