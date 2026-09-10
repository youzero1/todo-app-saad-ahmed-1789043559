import { fromInputParts, nextWeek, todayEvening, tomorrowMorning, toInputParts } from '@/lib/dates';

interface DueDatePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  idPrefix: string;
}

const shortcutClass =
  'rounded-full border border-hairline px-3 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export function DueDatePicker({ value, onChange, idPrefix }: DueDatePickerProps) {
  const parts = toInputParts(value);

  const setDate = (date: string) => {
    if (!date) {
      onChange(null);
      return;
    }
    onChange(fromInputParts(date, parts.time || '09:00'));
  };

  const setTime = (time: string) => {
    if (!parts.date) {
      const today = toInputParts(new Date().toISOString()).date;
      onChange(fromInputParts(today, time || '09:00'));
      return;
    }
    onChange(fromInputParts(parts.date, time || '09:00'));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor={`${idPrefix}-date`}
            className="mb-1 block text-xs font-medium text-muted"
          >
            Due date
          </label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            value={parts.date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor={`${idPrefix}-time`}
            className="mb-1 block text-xs font-medium text-muted"
          >
            Time
          </label>
          <input
            id={`${idPrefix}-time`}
            type="time"
            value={parts.time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={shortcutClass} onClick={() => onChange(todayEvening(new Date()))}>
          Today 18:00
        </button>
        <button
          type="button"
          className={shortcutClass}
          onClick={() => onChange(tomorrowMorning(new Date()))}
        >
          Tomorrow 09:00
        </button>
        <button type="button" className={shortcutClass} onClick={() => onChange(nextWeek(new Date()))}>
          Next week
        </button>
        {value && (
          <button
            type="button"
            className="rounded-full px-3 py-1 text-xs text-danger transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            onClick={() => onChange(null)}
          >
            Clear date
          </button>
        )}
      </div>
    </div>
  );
}
