export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  /** Full ISO timestamp so reminders can fire at a specific time of day. */
  dueAt: string | null;
  reminderMinutesBefore: number | null;
  /** Set once a reminder has been delivered; guarantees exactly-once delivery. */
  reminderFiredAt: string | null;
}

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export type DueBucket = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none';

export interface NewTaskInput {
  title: string;
  dueAt?: string | null;
  reminderMinutesBefore?: number | null;
}
