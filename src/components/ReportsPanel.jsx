import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

const iso = (d) => new Date(d).toISOString().slice(0, 10);

export default function ReportsPanel({ equipments, reservations, days }) {
  const byEquipment = useMemo(() => {
    const totalDays = days.length;
    const map = equipments.map((e) => {
      const reservedDays = new Set(
        reservations.filter((r) => r.equipmentId === e.id && days.some((d) => iso(d) === r.date)).map((r) => r.date)
      );
      const utilization = Math.round((reservedDays.size / totalDays) * 100);
      return { id: e.id, name: e.name, utilization };
    });
    const overall = Math.round(map.reduce((acc, cur) => acc + cur.utilization, 0) / (map.length || 1));
    return { rows: map, overall };
  }, [equipments, reservations, days]);

  return (
    <section aria-labelledby="reports-heading" className="rounded-lg border bg-white">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <BarChart3 className="h-5 w-5 text-blue-600" aria-hidden="true" />
        <h2 id="reports-heading" className="text-sm font-medium">Utilization Report (This Week)</h2>
        <div className="ml-auto text-xs text-neutral-600">Overall: <span className="font-semibold text-blue-700">{byEquipment.overall}%</span></div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {byEquipment.rows.map((row) => (
            <div key={row.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="truncate font-medium">{row.name}</div>
                <div className="text-neutral-600">{row.utilization}%</div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${row.utilization}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
