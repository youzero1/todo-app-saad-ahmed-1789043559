import { useState } from 'react';
import { TaskItem } from '@/components/TaskItem';
import type { Task } from '@/types/task';

interface CompletedSectionProps {
  tasks: Task[];
  now: Date;
  onToggle: (id: string) => void;
  onEdit: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
}

export function CompletedSection({
  tasks,
  now,
  onToggle,
  onEdit,
  onDelete,
  onClearCompleted,
}: CompletedSectionProps) {
  const [open, setOpen] = useState(false);
  if (tasks.length === 0) return null;

  return (
    <section className="border-t border-hairline pt-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="completed-list"
          className="rounded text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {open ? '▾' : '▸'} Completed
          <span className="ml-1.5 font-normal opacity-70">{tasks.length}</span>
        </button>
        <button
          type="button"
          onClick={onClearCompleted}
          className="rounded text-xs text-muted transition-colors hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        >
          Clear completed
        </button>
      </div>
      {open && (
        <ul id="completed-list" className="mt-2 border-t border-hairline">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              now={now}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
