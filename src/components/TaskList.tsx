import { TaskItem } from '@/components/TaskItem';
import { groupTasksByBucket } from '@/lib/tasks';
import type { Task, TaskFilter } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  now: Date;
  onToggle: (id: string) => void;
  onEdit: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const GROUPED_FILTERS: TaskFilter[] = ['all', 'today', 'upcoming'];

export function TaskList({ tasks, filter, now, onToggle, onEdit, onDelete }: TaskListProps) {
  const rows = (list: Task[]) =>
    list.map((task) => (
      <TaskItem
        key={task.id}
        task={task}
        now={now}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ));

  if (!GROUPED_FILTERS.includes(filter)) {
    return <ul className="border-t border-hairline">{rows(tasks)}</ul>;
  }

  const sections = groupTasksByBucket(tasks, now);

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.bucket} aria-labelledby={`section-${section.bucket}`}>
          <h2
            id={`section-${section.bucket}`}
            className={`mb-1 text-xs font-semibold uppercase tracking-wide ${
              section.bucket === 'overdue' ? 'text-danger' : 'text-muted'
            }`}
          >
            {section.label}
            <span className="ml-1.5 font-normal opacity-70">{section.tasks.length}</span>
          </h2>
          <ul className="border-t border-hairline">{rows(section.tasks)}</ul>
        </section>
      ))}
    </div>
  );
}
