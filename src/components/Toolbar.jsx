import React from 'react';
import { Calendar as CalendarIcon, User, Settings } from 'lucide-react';

function formatRange(start) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts = { month: 'short', day: 'numeric' };
  const yOpts = { year: 'numeric' };
  const startStr = start.toLocaleDateString(undefined, opts);
  const endStr = end.toLocaleDateString(undefined, { ...opts, ...((start.getMonth() !== end.getMonth()) ? {} : {}) });
  const yearStr = end.toLocaleDateString(undefined, yOpts);
  return `${startStr} - ${endStr}, ${yearStr}`;
}

export default function Toolbar({ role, onRoleChange, weekStart, onWeekChange, filters, onFiltersChange }) {
  const goPrev = () => onWeekChange((d) => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd; });
  const goNext = () => onWeekChange((d) => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd; });
  const goToday = () => onWeekChange((_) => { const today = new Date(); today.setHours(0,0,0,0); const day = today.getDay(); const diff = (day === 0 ? -6 : 1) - day; today.setDate(today.getDate()+diff); return today; });

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
          <h1 className="text-xl font-semibold">Resource Scheduler</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm" htmlFor="role-select">
            <User className="h-4 w-4 text-neutral-600" aria-hidden="true" />
            <span className="sr-only">Select role</span>
            <select
              id="role-select"
              aria-label="Select user role"
              className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="scheduler">Scheduler</option>
              <option value="operator">Operator</option>
            </select>
          </label>
          <button
            type="button"
            aria-label="Settings"
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2" role="group" aria-label="Week navigation">
          <button onClick={goPrev} className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Previous week">◀</button>
          <button onClick={goToday} className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Go to current week">Today</button>
          <button onClick={goNext} className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Next week">▶</button>
          <div className="ml-3 text-sm text-neutral-700" aria-live="polite">{formatRange(weekStart)}</div>
        </div>

        <div className="flex items-center gap-2" role="search">
          <input
            type="search"
            aria-label="Search equipment"
            placeholder="Search equipment..."
            className="w-48 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
          <select
            aria-label="Filter by type"
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
          >
            <option value="all">All types</option>
            <option value="Crane">Crane</option>
            <option value="Excavator">Excavator</option>
            <option value="Telehandler">Telehandler</option>
            <option value="Mixer">Mixer</option>
          </select>
        </div>
      </div>
    </div>
  );
}
