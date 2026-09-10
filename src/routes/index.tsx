import { useMemo, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CompletedSection } from '@/components/CompletedSection';
import { EmptyState } from '@/components/EmptyState';
import { FilterTabs } from '@/components/FilterTabs';
import { TaskComposer } from '@/components/TaskComposer';
import { TaskList } from '@/components/TaskList';
import { useNow } from '@/hooks/useNow';
import { useTaskStore } from '@/hooks/useTaskStore';
import { countsByFilter, filterTasks } from '@/lib/tasks';
import type { TaskFilter } from '@/types/task';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const store = useTaskStore();
  const now = useNow();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const counts = useMemo(() => countsByFilter(store.tasks, now), [store.tasks, now]);
  const composerRef = useRef<HTMLInputElement | null>(null);
  const visible = useMemo(
    () => filterTasks(store.tasks, filter, now),
    [store.tasks, filter, now],
  );

  const completed = useMemo(
    () => filterTasks(store.tasks, 'completed', now),
    [store.tasks, now],
  );

  const handleDelete = (id: string) => {
    const task = store.tasks.find((t) => t.id === id);
    store.deleteTask(id);
    if (task) store.pushToast(`Deleted “${task.title}”`);
  };

  const handleToggle = (id: string) => {
    const task = store.tasks.find((t) => t.id === id);
    store.toggleTask(id);
    if (task) {
      store.pushToast(task.completed ? `Reopened “${task.title}”` : `Completed “${task.title}”`);
    }
  };

  return (
    <div className="space-y-8">
      {!store.loading && store.tasks.length === 0 && (
        <p className="text-sm leading-relaxed text-muted">
          Welcome. Add a task below — give it a due date and a reminder, and it will nudge you when
          the time comes. Everything stays in this browser.
        </p>
      )}

      <TaskComposer
        onAdd={(input) => {
          store.addTask(input);
          store.pushToast(`Added “${input.title.trim()}”`);
        }}
        defaultReminderMinutes={store.prefs.defaultReminderMinutes}
        inputRef={composerRef}
      />

      <FilterTabs value={filter} onChange={setFilter} counts={counts} />

      {visible.length > 0 ? (
        <TaskList
          tasks={visible}
          filter={filter}
          now={now}
          onToggle={handleToggle}
          onEdit={store.editTask}
          onDelete={handleDelete}
        />
      ) : (
        !store.loading && (
          <EmptyState
            filter={filter}
            totalTasks={store.tasks.length}
            onAddFocus={
              filter === 'all' && store.tasks.length === 0
                ? () => composerRef.current?.focus()
                : undefined
            }
          />
        )
      )}

      {filter === 'all' && (
        <CompletedSection
          tasks={completed}
          now={now}
          onToggle={handleToggle}
          onEdit={store.editTask}
          onDelete={handleDelete}
          onClearCompleted={() => {
            store.clearCompleted();
            store.pushToast('Cleared completed tasks');
          }}
        />
      )}
    </div>
  );
}
