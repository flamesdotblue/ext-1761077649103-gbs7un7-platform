import React, { useState } from 'react';
import { Wrench, MapPin } from 'lucide-react';

function EquipmentModal({ equipment, onClose }) {
  if (!equipment) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="eq-modal-title">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex flex-col md:flex-row">
          <img src={equipment.image} alt="Equipment" className="h-48 w-full object-cover md:h-auto md:w-1/3" />
          <div className="flex-1 p-4">
            <h2 id="eq-modal-title" className="text-lg font-semibold">{equipment.name}</h2>
            <p className="text-sm text-neutral-600">Type: {equipment.type}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(equipment.specs || {}).map(([k, v]) => (
                <div key={k} className="rounded border bg-neutral-50 p-2">
                  <span className="font-medium capitalize">{k}</span>: {v}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-medium text-neutral-800"><Wrench className="h-4 w-4 text-yellow-600" /> Maintenance schedule</h3>
              <ul className="list-inside list-disc text-sm text-neutral-700">
                {equipment.maintenance && equipment.maintenance.length > 0 ? (
                  equipment.maintenance.map((d) => <li key={d}>{d}</li>)
                ) : (
                  <li>No upcoming maintenance</li>
                )}
              </ul>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentPanel({ equipments, canEdit }) {
  const [openEq, setOpenEq] = useState(null);

  return (
    <section aria-labelledby="equipment-heading" className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 id="equipment-heading" className="text-sm font-medium">Equipment</h2>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" /> Available</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" /> Reserved</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-400" aria-hidden="true" /> Maintenance</span>
        </div>
      </div>
      <ul className="max-h-[60vh] divide-y overflow-auto" role="listbox" aria-label="Equipment list">
        {equipments.map((eq) => (
          <li
            key={eq.id}
            role="option"
            aria-selected="false"
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 focus-within:bg-neutral-50"
          >
            <img src={eq.image} alt="" className="h-12 w-12 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium">{eq.name}</p>
                <button
                  onClick={() => setOpenEq(eq)}
                  className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`View details for ${eq.name}`}
                >
                  Details
                </button>
              </div>
              <p className="truncate text-xs text-neutral-500">{eq.type}</p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-600">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Drag item to calendar to reserve</span>
              </div>
            </div>
            <div
              draggable={canEdit}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'equipment', equipmentId: eq.id }));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              aria-label={`Drag ${eq.name} to schedule`}
              className={`ml-auto select-none rounded-md border px-2 py-1 text-xs ${canEdit ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'}`}
            >
              Reserve
            </div>
          </li>
        ))}
      </ul>

      <EquipmentModal equipment={openEq} onClose={() => setOpenEq(null)} />
    </section>
  );
}
