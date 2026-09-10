import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useReminders } from '@/hooks/useReminders';
import { useTasks, type UseTasks } from '@/hooks/useTasks';
import { clearAllData, loadPrefs, savePrefs, type Prefs } from '@/lib/storage';

export interface ToastMessage {
  id: string;
  message: string;
}

export interface TaskStore extends UseTasks {
  toasts: ToastMessage[];
  pushToast: (message: string) => void;
  dismissToast: (id: string) => void;
  prefs: Prefs;
  setDefaultReminderMinutes: (minutes: number | null) => void;
  showPermissionBanner: boolean;
  dismissPermissionBanner: () => void;
  resetEverything: () => void;
}

const TaskStoreContext = createContext<TaskStore | null>(null);

let toastSeq = 0;

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const tasksApi = useTasks();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [bannerRevealed, setBannerRevealed] = useState(false);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const pushToast = useCallback((message: string) => {
    toastSeq += 1;
    const id = `toast_${toastSeq}`;
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const revealPermissionBanner = useCallback(() => setBannerRevealed(true), []);

  const dismissPermissionBanner = useCallback(() => {
    setBannerRevealed(false);
    setPrefs((p) => ({ ...p, hidePermissionBanner: true }));
  }, []);

  const setDefaultReminderMinutes = useCallback((minutes: number | null) => {
    setPrefs((p) => ({ ...p, defaultReminderMinutes: minutes }));
  }, []);

  const resetEverything = useCallback(() => {
    clearAllData();
    tasksApi.replaceAll([]);
    setPrefs({ defaultReminderMinutes: 30, hidePermissionBanner: false });
    setToasts([]);
  }, [tasksApi]);

  const delivery = useMemo(
    () => ({ pushToast, revealPermissionBanner }),
    [pushToast, revealPermissionBanner],
  );

  useReminders(tasksApi.tasks, tasksApi.editTask, delivery);

  const value: TaskStore = {
    ...tasksApi,
    toasts,
    pushToast,
    dismissToast,
    prefs,
    setDefaultReminderMinutes,
    showPermissionBanner: bannerRevealed && !prefs.hidePermissionBanner,
    dismissPermissionBanner,
    resetEverything,
  };

  return <TaskStoreContext.Provider value={value}>{children}</TaskStoreContext.Provider>;
}

export function useTaskStore(): TaskStore {
  const ctx = useContext(TaskStoreContext);
  if (!ctx) throw new Error('useTaskStore must be used inside TaskStoreProvider');
  return ctx;
}
