import { useEffect } from 'react';
import type { ToastMessage } from '@/hooks/useTaskStore';

interface ToastHostProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

function ToastRow({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const id = window.setTimeout(() => onDismiss(toast.id), 6000);
    return () => window.clearTimeout(id);
  }, [toast.id, onDismiss]);

  return (
    <div className="pointer-events-auto flex items-start gap-3 rounded-lg bg-ink px-4 py-3 text-sm text-white shadow-lg">
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="-mr-1 rounded px-1 text-white/60 transition-opacity hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        ×
      </button>
    </div>
  );
}

export function ToastHost({ toasts, onDismiss }: ToastHostProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md flex-col gap-2 p-4"
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
