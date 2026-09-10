export type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

/** Guarded access — never throws in insecure or unsupported contexts. */
export function isSupported(): boolean {
  try {
    return typeof window !== 'undefined' && 'Notification' in window;
  } catch {
    return false;
  }
}

export function getPermission(): PermissionState {
  try {
    if (!isSupported()) return 'unsupported';
    const p = window.Notification.permission;
    return p === 'granted' || p === 'denied' ? p : 'default';
  } catch {
    return 'unsupported';
  }
}

/** Only ever called from the explicit control on /settings. */
export async function requestPermission(): Promise<PermissionState> {
  try {
    if (!isSupported()) return 'unsupported';
    const result = await window.Notification.requestPermission();
    return result === 'granted' || result === 'denied' ? result : 'default';
  } catch {
    return getPermission();
  }
}

export function notify(title: string, body: string): boolean {
  try {
    if (!isSupported() || getPermission() !== 'granted') return false;
    new window.Notification(title, { body, tag: `todo-${title}-${body}` });
    return true;
  } catch {
    return false;
  }
}
