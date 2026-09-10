import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { REMINDER_OPTIONS } from '@/components/TaskComposer';
import { useTaskStore } from '@/hooks/useTaskStore';
import { getPermission, requestPermission, type PermissionState } from '@/lib/notifications';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

const PERMISSION_COPY: Record<PermissionState, string> = {
  granted: 'Reminders appear as browser notifications, even when this tab is in the background.',
  denied:
    'Notifications are blocked for this site, so reminders appear as in-app messages instead. You can re-enable them in your browser’s site settings.',
  default: 'Reminders currently appear as in-app messages only. Enable notifications to be nudged when this tab is in the background.',
  unsupported: 'This browser does not support notifications, so reminders appear as in-app messages.',
};

function SettingsPage() {
  const store = useTaskStore();
  const [permission, setPermission] = useState<PermissionState>(() => getPermission());
  const [confirmingReset, setConfirmingReset] = useState(false);

  const onEnable = async () => {
    const next = await requestPermission();
    setPermission(next);
    store.pushToast(
      next === 'granted' ? 'Notifications enabled' : 'Notifications were not enabled',
    );
  };

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div>
          <h1 className="text-base font-semibold text-ink">Notifications</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted">{PERMISSION_COPY[permission]}</p>
        </div>
        {permission === 'default' && (
          <button
            type="button"
            onClick={onEnable}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Enable notifications
          </button>
        )}
        {permission === 'granted' && (
          <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            Enabled
          </p>
        )}
      </section>

      <section className="space-y-3 border-t border-hairline pt-8">
        <div>
          <h2 className="text-base font-semibold text-ink">Default reminder</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Pre-selected when you add a due date to a new task.
          </p>
        </div>
        <label htmlFor="default-reminder" className="sr-only">
          Default reminder lead time
        </label>
        <select
          id="default-reminder"
          value={
            store.prefs.defaultReminderMinutes === null
              ? ''
              : String(store.prefs.defaultReminderMinutes)
          }
          onChange={(e) =>
            store.setDefaultReminderMinutes(e.target.value === '' ? null : Number(e.target.value))
          }
          className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
        >
          {REMINDER_OPTIONS.map((o) => (
            <option key={o.label} value={o.value === null ? '' : String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-3 border-t border-hairline pt-8">
        <div>
          <h2 className="text-base font-semibold text-ink">Clear all data</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Permanently removes every task and preference stored in this browser.
          </p>
        </div>
        {confirmingReset ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                store.resetEverything();
                setConfirmingReset(false);
                store.pushToast('All data cleared');
              }}
              className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
            >
              Yes, delete everything
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="rounded-lg border border-danger px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
          >
            Clear all data
          </button>
        )}
      </section>

      <Link
        to="/"
        className="inline-block rounded text-sm text-accent underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Back to your tasks
      </Link>
    </div>
  );
}
