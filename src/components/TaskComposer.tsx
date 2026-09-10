import { useRef, useState } from 'react';
import { DueDatePicker } from '@/components/DueDatePicker';
import type { NewTaskInput } from '@/types/task';

export const REMINDER_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'No reminder', value: null },
  { label: 'At due time', value: 0 },
  { label: '10 minutes before', value: 10 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
];

interface TaskComposerProps {
  onAdd: (input: NewTaskInput) => void;
  defaultReminderMinutes: number | null;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function TaskComposer({ onAdd, defaultReminderMinutes, inputRef }: TaskComposerProps) {
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState<string | null>(null);
  const [reminder, setReminder] = useState<number | null>(defaultReminderMinutes);
  const [expanded, setExpanded] = useState(false);
  const localRef = useRef<HTMLInputElement | null>(null);
  const ref = inputRef ?? localRef;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, dueAt, reminderMinutesBefore: dueAt ? reminder : null });
    setTitle('');
    setDueAt(null);
    setReminder(defaultReminderMinutes);
    ref.current?.focus();
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-hairline bg-white p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <label htmlFor="composer-title" className="sr-only">
          Task title
        </label>
        <input
          id="composer-title"
          ref={ref}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task and press Enter"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg px-2 py-2 text-base text-ink placeholder:text-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Add
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 px-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="composer-details"
          className="rounded text-xs font-medium text-muted transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {expanded ? 'Hide due date' : dueAt ? 'Edit due date' : 'Add due date & reminder'}
        </button>
      </div>

      {expanded && (
        <div id="composer-details" className="mt-3 space-y-3 border-t border-hairline px-2 pt-3">
          <DueDatePicker value={dueAt} onChange={setDueAt} idPrefix="composer" />
          <div>
            <label htmlFor="composer-reminder" className="mb-1 block text-xs font-medium text-muted">
              Reminder
            </label>
            <select
              id="composer-reminder"
              value={reminder === null ? '' : String(reminder)}
              disabled={!dueAt}
              onChange={(e) => setReminder(e.target.value === '' ? null : Number(e.target.value))}
              className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink disabled:opacity-50 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
            >
              {REMINDER_OPTIONS.map((o) => (
                <option key={o.label} value={o.value === null ? '' : String(o.value)}>
                  {o.label}
                </option>
              ))}
            </select>
            {!dueAt && (
              <p className="mt-1 text-xs text-muted">Set a due date to enable reminders.</p>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
