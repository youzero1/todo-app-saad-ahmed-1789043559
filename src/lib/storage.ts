import type { Task } from '@/types/task';

const STORAGE_KEY = 'summon.todo.v1';
const SCHEMA_VERSION = 1;

export const PREFS_KEY = 'summon.todo.prefs.v1';

interface Envelope {
  version: number;
  tasks: unknown;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function isoOrNull(v: unknown): string | null {
  const s = str(v);
  if (!s) return null;
  return Number.isNaN(new Date(s).getTime()) ? null : s;
}

/** Field-by-field validation — malformed records are discarded, never thrown. */
function parseTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = str(o.id);
  const title = typeof o.title === 'string' ? o.title : null;
  if (!id || title === null || title.trim() === '') return null;
  const createdAt = isoOrNull(o.createdAt) ?? new Date().toISOString();
  const reminder =
    typeof o.reminderMinutesBefore === 'number' && Number.isFinite(o.reminderMinutesBefore)
      ? o.reminderMinutesBefore
      : null;
  const completed = o.completed === true;
  return {
    id,
    title,
    completed,
    createdAt,
    updatedAt: isoOrNull(o.updatedAt) ?? createdAt,
    completedAt: completed ? isoOrNull(o.completedAt) : null,
    dueAt: isoOrNull(o.dueAt),
    reminderMinutesBefore: reminder,
    reminderFiredAt: isoOrNull(o.reminderFiredAt),
  };
}

export function loadTasks(): Task[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : (parsed as Envelope | null)?.tasks;
    if (!Array.isArray(list)) return [];
    return list.map(parseTask).filter((t): t is Task => t !== null);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    const envelope: Envelope = { version: SCHEMA_VERSION, tasks };
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Quota exceeded or storage blocked (privacy mode) — never crash the app.
  }
}

export function clearAllData(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
    globalThis.localStorage?.removeItem(PREFS_KEY);
  } catch {
    // ignore
  }
}

export interface Prefs {
  defaultReminderMinutes: number | null;
  hidePermissionBanner: boolean;
}

const DEFAULT_PREFS: Prefs = { defaultReminderMinutes: 30, hidePermissionBanner: false };

export function loadPrefs(): Prefs {
  try {
    const raw = globalThis.localStorage?.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const o = JSON.parse(raw) as Record<string, unknown>;
    return {
      defaultReminderMinutes:
        typeof o.defaultReminderMinutes === 'number' || o.defaultReminderMinutes === null
          ? (o.defaultReminderMinutes as number | null)
          : DEFAULT_PREFS.defaultReminderMinutes,
      hidePermissionBanner: o.hidePermissionBanner === true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Prefs): void {
  try {
    globalThis.localStorage?.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}
