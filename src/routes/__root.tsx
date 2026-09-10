import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { ToastHost } from '@/components/Toast';
import { useNow } from '@/hooks/useNow';
import { TaskStoreProvider, useTaskStore } from '@/hooks/useTaskStore';
import { dueTodayCount } from '@/lib/tasks';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <TaskStoreProvider>
      <Shell />
    </TaskStoreProvider>
  );
}

function Shell() {
  const { tasks, toasts, dismissToast, showPermissionBanner, dismissPermissionBanner } =
    useTaskStore();
  const now = useNow();
  const dueToday = dueTodayCount(tasks, now);

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-5">
          <div>
            <Link
              to="/"
              className="rounded text-lg font-semibold tracking-tight text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Today&rsquo;s List
            </Link>
            <p className="mt-1 text-sm text-muted">
              {dueToday === 0
                ? 'Nothing due today'
                : `${dueToday} ${dueToday === 1 ? 'task' : 'tasks'} due today`}
            </p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              activeProps={{ className: 'text-ink font-medium' }}
              inactiveProps={{ className: 'text-muted hover:text-ink' }}
              className="rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Tasks
            </Link>
            <Link
              to="/settings"
              activeProps={{ className: 'text-ink font-medium' }}
              inactiveProps={{ className: 'text-muted hover:text-ink' }}
              className="rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Settings
            </Link>
          </nav>
        </header>

        {showPermissionBanner && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg bg-accent-soft px-4 py-3 text-sm text-ink">
            <p className="flex-1 leading-snug">
              Turn on notifications to get reminders even when this tab is in the background.
            </p>
            <Link
              to="/settings"
              className="rounded font-medium text-accent underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Open settings
            </Link>
            <button
              type="button"
              onClick={dismissPermissionBanner}
              className="rounded px-1 text-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Dismiss notification tip"
            >
              ×
            </button>
          </div>
        )}

        <main className="pt-6">
          <Outlet />
        </main>
      </div>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-sm text-muted">This page does not exist.</p>
      <Link to="/" className="text-sm text-accent underline underline-offset-4">
        Back to your tasks
      </Link>
    </div>
  );
}
