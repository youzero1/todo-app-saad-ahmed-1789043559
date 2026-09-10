import type { TaskFilter } from '@/types/task';

interface EmptyStateProps {
  filter: TaskFilter;
  totalTasks: number;
  onAddFocus?: () => void;
}

const COPY: Record<TaskFilter, { title: string; body: string }> = {
  all: { title: 'Nothing on your list', body: 'Add your first task above to get started.' },
  today: { title: 'Nothing due today', body: 'Enjoy the clear day, or plan something ahead.' },
  upcoming: { title: 'Nothing upcoming', body: 'Tasks with a future due date will show up here.' },
  overdue: { title: 'Nothing overdue', body: 'You are all caught up.' },
  completed: { title: 'Nothing completed yet', body: 'Tasks you finish will collect here.' },
};

export function EmptyState({ filter, totalTasks, onAddFocus }: EmptyStateProps) {
  const copy =
    filter === 'all' && totalTasks > 0
      ? { title: 'All active tasks done', body: 'Completed work is tucked away below.' }
      : COPY[filter];

  return (
    <div className="rounded-xl border border-dashed border-hairline px-6 py-10 text-center">
      <p className="text-sm font-medium text-ink">{copy.title}</p>
      <p className="mt-1 text-sm text-muted">{copy.body}</p>
      {onAddFocus && (
        <button
          type="button"
          onClick={onAddFocus}
          className="mt-4 rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Add a task
        </button>
      )}
    </div>
  );
}
