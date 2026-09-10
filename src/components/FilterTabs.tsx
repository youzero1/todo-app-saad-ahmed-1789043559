import { useRef } from 'react';
import type { TaskFilter } from '@/types/task';

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
];

interface FilterTabsProps {
  value: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  counts: Record<TaskFilter, number>;
}

export function FilterTabs({ value, onChange, counts }: FilterTabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = FILTERS.findIndex((f) => f.value === value);
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % FILTERS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + FILTERS.length) % FILTERS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = FILTERS.length - 1;
    else return;
    e.preventDefault();
    const target = FILTERS[next];
    onChange(target.value);
    refs.current[target.value]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Filter tasks"
      onKeyDown={onKeyDown}
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {FILTERS.map((f) => {
        const selected = f.value === value;
        const isOverdue = f.value === 'overdue' && counts.overdue > 0;
        return (
          <button
            key={f.value}
            ref={(el) => {
              refs.current[f.value] = el;
            }}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(f.value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
              selected
                ? 'bg-ink text-white'
                : isOverdue
                  ? 'text-danger hover:bg-danger-soft'
                  : 'text-muted hover:bg-hairline/60 hover:text-ink'
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-xs ${selected ? 'text-white/60' : 'opacity-70'}`}>
              {counts[f.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
