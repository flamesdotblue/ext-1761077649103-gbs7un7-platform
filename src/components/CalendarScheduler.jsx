import React, { useMemo, useState } from 'react';
import { MapPin, Mail, X } from 'lucide-react';

const iso = (d) => new Date(d).toISOString().slice(0, 10);

function DayHeader({ date }) {
  const isToday = iso(date) === iso(new Date());
  const day = date.toLocaleDateString(undefined, { weekday: 'short' });
  const md = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <div className={`sticky top-[145px] z-10 border-b bg-white px-2 py-2 text-xs sm:text-sm ${isToday ? 'text-blue-700 font-medium' : 'text-neutral-700'}`} aria-label={iso(date)}>
      <div>{day}</div>
      <div className="text-neutral-500">{md}</div>
    </div>
  );
}

function ReservationBadge({ reservation, project, site, onCancel, draggableProps }) {
  return (
    <div
      className="group relative flex cursor-grab items-center justify-between gap-2 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-800 shadow-sm"
      {...draggableProps}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{project?.name || 'Project'}</div>
        <div className="flex items-center gap-1 text-[10px] text-red-700"><MapPin className="h-3 w-3" /> {site?.name || 'Site'}</div>
      </div>
      {onCancel && (
        <button
          className="opacity-0 group-hover:opacity-100 rounded p-1 text-red-600 hover:bg-red-100 focus:opacity-100 focus:outline-none"
          aria-label="Cancel reservation"
          onClick={onCancel}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function ReservationForm({ open, onClose, onSubmit, projects, sites, defaultValues }) {
  const [projectId, setProjectId] = useState(defaultValues?.projectId || projects[0]?.id);
  const [siteId, setSiteId] = useState(defaultValues?.siteId || sites[0]?.id);
  const [operatorName, setOperatorName] = useState(defaultValues?.operatorName || '');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="new-res-title">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <h3 id="new-res-title" className="text-base font-semibold">Create Reservation</h3>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ projectId, siteId, operatorName });
          }}
        >
          <label className="block text-sm">
            <span className="text-neutral-700">Project</span>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-neutral-700">Job Site</span>
            <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-neutral-700">Operator</span>
            <input value={operatorName} onChange={(e) => setOperatorName(e.target.value)} placeholder="Operator name" className="mt-1 w-full rounded-md border px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-neutral-500"><Mail className="h-3.5 w-3.5" /> Email confirmation will be sent</div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500">Cancel</button>
              <button type="submit" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Create</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CalendarScheduler({ role, canEdit, days, equipments, reservations, projects, sites, onCreateReservation, onUpdateReservationDate, onCancelReservation, isMaintenance, hasReservation }) {
  const [draft, setDraft] = useState(null); // { equipmentId, date }

  const grid = useMemo(() => {
    const map = {};
    for (const r of reservations) {
      map[`${r.equipmentId}:${r.date}`] = r;
    }
    return map;
  }, [reservations]);

  const handleDropNew = (equipmentId, date, dt) => {
    if (!canEdit) return;
    try {
      const payload = JSON.parse(dt.getData('text/plain'));
      if (payload?.type === 'equipment' && payload?.equipmentId === equipmentId) {
        setDraft({ equipmentId, date });
      }
      if (payload?.type === 'reservation') {
        onUpdateReservationDate(payload.reservationId, date);
      }
    } catch (e) {
      // ignore
    }
  };

  const cellStatus = (equipmentId, date) => {
    const d = iso(date);
    if (isMaintenance(equipmentId, d)) return 'maintenance';
    const res = grid[`${equipmentId}:${d}`];
    if (res) return 'reserved';
    return 'available';
  };

  const bgByStatus = (status) =>
    status === 'reserved' ? 'bg-red-50 border-red-200' : status === 'maintenance' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200';

  const labelByStatus = (status) => (status === 'reserved' ? 'Reserved' : status === 'maintenance' ? 'Maintenance' : 'Available');

  return (
    <section className="rounded-lg border bg-white" aria-labelledby="calendar-heading">
      <div className="flex items-center justify-between border-b px-3 py-3">
        <h2 id="calendar-heading" className="text-sm font-medium">Week Schedule</h2>
        <div className="text-xs text-neutral-500">Role: <span className="font-medium">{role}</span></div>
      </div>

      <div className="overflow-auto" role="grid" aria-label="Equipment schedule grid">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-8">
            <div className="sticky left-0 z-10 border-b bg-white px-2 py-2 text-xs font-medium text-neutral-700">Equipment</div>
            {days.map((d) => (
              <DayHeader key={iso(d)} date={d} />
            ))}
          </div>

          {equipments.map((eq) => (
            <div key={eq.id} className="grid grid-cols-8">
              <div className="sticky left-0 z-10 flex items-center gap-2 border-b bg-white px-2 py-2 text-xs">
                <img src={eq.image} alt="" className="h-6 w-6 rounded object-cover" />
                <div className="min-w-0">
                  <div className="truncate font-medium">{eq.name}</div>
                  <div className="truncate text-[11px] text-neutral-500">{eq.type}</div>
                </div>
              </div>

              {days.map((d) => {
                const status = cellStatus(eq.id, d);
                const res = grid[`${eq.id}:${iso(d)}`];
                const canDrop = canEdit;
                return (
                  <div
                    key={iso(d)}
                    role="gridcell"
                    aria-label={`${eq.name} ${iso(d)} ${labelByStatus(status)}`}
                    tabIndex={0}
                    className={`min-h-[72px] border-b px-2 py-1 outline-none ${bgByStatus(status)} focus:ring-2 focus:ring-blue-400`}
                    onKeyDown={(e) => {
                      if (!canEdit) return;
                      if (e.key === 'Enter') setDraft({ equipmentId: eq.id, date: d });
                    }}
                    onDragOver={(e) => { if (canDrop) e.preventDefault(); }}
                    onDrop={(e) => handleDropNew(eq.id, d, e.dataTransfer)}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] text-neutral-600">
                        <span className="rounded bg-white/70 px-1 py-0.5">{labelByStatus(status)}</span>
                        {status === 'maintenance' && <span className="text-yellow-700">Service</span>}
                      </div>

                      {res ? (
                        <ReservationBadge
                          reservation={res}
                          project={projects.find((p) => p.id === res.projectId)}
                          site={sites.find((s) => s.id === res.siteId)}
                          onCancel={canEdit ? () => onCancelReservation(res.id) : undefined}
                          draggableProps={{
                            draggable: canEdit,
                            onDragStart: (e) => {
                              e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'reservation', reservationId: res.id }));
                              e.dataTransfer.effectAllowed = 'move';
                            },
                          }}
                        />
                      ) : (
                        <div className="h-6" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <ReservationForm
        open={!!draft}
        onClose={() => setDraft(null)}
        projects={projects}
        sites={sites}
        onSubmit={({ projectId, siteId, operatorName }) => {
          if (draft) {
            onCreateReservation({ equipmentId: draft.equipmentId, date: draft.date, projectId, siteId, operatorName });
          }
          setDraft(null);
        }}
      />
    </section>
  );
}
