import { useEffect, useRef, useState } from 'react';
import { DueBadge } from '@/components/DueBadge';
import { DueDatePicker } from '@/components/DueDatePicker';
import { REMINDER_OPTIONS } from '@/components/TaskComposer';
import type { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  now: Date;
  onToggle: (id: string) => void;
  onEdit: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, now, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [showSchedule, setShowSchedule] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = () => {
    setDraft(task.title);
    setEditing(true);
  };

  const commit = () => {
    const next = draft.trim();
    setEditing(false);
    if (!next || next === task.title) return;
    onEdit(task.id, { title: next });
  };

  const cancel = () => {
    setDraft(task.title);
    setEditing(false);
  };

  return (
    <li className="group border-b border-hairline last:border-b-0">
      <div className="flex items-start gap-3 py-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={task.completed ? `Mark “${task.title}” as active` : `Complete “${task.title}”`}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        />

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={draft}
              aria-label="Edit task title"
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancel();
                }
              }}
              className="w-full rounded-md border border-accent bg-white px-2 py-1 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          ) : (
            <p
              onDoubleClick={startEdit}
              className={`break-words text-sm leading-snug ${
                task.completed ? 'text-muted line-through' : 'text-ink'
              }`}
            >
              {task.title}
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <DueBadge
              dueAt={task.dueAt}
              now={now}
              hasReminder={task.reminderMinutesBefore !== null}
              completed={task.completed}
            />
            <button
              type="button"
              onClick={() => setShowSchedule((v) => !v)}
              aria-expanded={showSchedule}
              className="rounded text-xs text-muted opacity-0 transition-opacity hover:text-accent focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent group-hover:opacity-100"
            >
              {task.dueAt ? 'Reschedule' : 'Add due date'}
            </button>
          </div>

          {showSchedule && (
            <div className="mt-3 space-y-3 rounded-lg bg-hairline/25 p-3">
              <DueDatePicker
                value={task.dueAt}
                onChange={(value) =>
                  onEdit(task.id, {
                    dueAt: value,
                    reminderMinutesBefore: value ? task.reminderMinutesBefore : null,
                  })
                }
                idPrefix={`task-${task.id}`}
              />
              <div>
                <label
                  htmlFor={`task-${task.id}-reminder`}
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Reminder
                </label>
                <select
                  id={`task-${task.id}-reminder`}
                  value={task.reminderMinutesBefore === null ? '' : String(task.reminderMinutesBefore)}
                  disabled={!task.dueAt}
                  onChange={(e) =>
                    onEdit(task.id, {
                      reminderMinutesBefore: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink disabled:opacity-50 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
                >
                  {REMINDER_OPTIONS.map((o) => (
                    <option key={o.label} value={o.value === null ? '' : String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!task.completed && !editing && (
            <button
              type="button"
              onClick={startEdit}
              aria-label={`Edit “${task.title}”`}
              className="rounded px-2 py-1 text-xs text-muted opacity-0 transition-opacity hover:text-accent focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent group-hover:opacity-100"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete “${task.title}”`}
            className="rounded px-2 py-1 text-xs text-muted opacity-0 transition-opacity hover:text-danger focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-danger group-hover:opacity-100"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
