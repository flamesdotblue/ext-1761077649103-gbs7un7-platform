import React, { useMemo, useState, useEffect } from 'react';
import Toolbar from './components/Toolbar.jsx';
import EquipmentPanel from './components/EquipmentPanel.jsx';
import CalendarScheduler from './components/CalendarScheduler.jsx';
import ReportsPanel from './components/ReportsPanel.jsx';

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const isoDate = (date) => new Date(date).toISOString().slice(0, 10);

const DEFAULT_PROJECTS = [
  { id: 'p1', name: 'Downtown Tower' },
  { id: 'p2', name: 'Riverside Bridge' },
  { id: 'p3', name: 'Logistics Hub' },
];

const DEFAULT_SITES = [
  { id: 's1', name: 'Site A - North District', address: '120 North Ave' },
  { id: 's2', name: 'Site B - Riverside', address: '780 River Rd' },
  { id: 's3', name: 'Site C - Industrial Park', address: '42 Workline St' },
];

const DEFAULT_EQUIPMENT = [
  {
    id: 'eq1',
    name: 'Crawler Crane CC-3000',
    type: 'Crane',
    image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1280&auto=format&fit=crop',
    specs: {
      capacity: '300t',
      boomLength: '60m',
      fuel: 'Diesel',
    },
    maintenance: [isoDate(addDays(new Date(), 3)), isoDate(addDays(new Date(), 20))],
  },
  {
    id: 'eq2',
    name: 'Excavator EX-90',
    type: 'Excavator',
    image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=1280&auto=format&fit=crop',
    specs: {
      bucket: '1.2 m³',
      reach: '9.5m',
      fuel: 'Diesel',
    },
    maintenance: [isoDate(addDays(new Date(), 1))],
  },
  {
    id: 'eq3',
    name: 'Telehandler TH-12',
    type: 'Telehandler',
    image: 'https://images.unsplash.com/photo-1707054665055-387625df43b1?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxUZWxlaGFuZGxlciUyMFRILTEyfGVufDB8MHx8fDE3NjEwNzc3NjN8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80',
    specs: {
      liftHeight: '12m',
      capacity: '3.5t',
      fuel: 'Hybrid',
    },
    maintenance: [],
  },
  {
    id: 'eq4',
    name: 'Concrete Mixer MX-500',
    type: 'Mixer',
    image: 'https://images.unsplash.com/photo-1563974876412-77c51386dcad?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxDb25jcmV0ZSUyME1peGVyJTIwTVgtNTAwfGVufDB8MHx8fDE3NjEwNzc3NjR8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80',
    specs: {
      drum: '9 m³',
      power: '250 HP',
      fuel: 'Diesel',
    },
    maintenance: [isoDate(addDays(new Date(), 5))],
  },
];

export default function App() {
  const [role, setRole] = useState('scheduler'); // admin | scheduler | operator
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [equipments, setEquipments] = useState(DEFAULT_EQUIPMENT);
  const [projects] = useState(DEFAULT_PROJECTS);
  const [sites] = useState(DEFAULT_SITES);
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: 'all' });

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const canEdit = role === 'admin' || role === 'scheduler';

  const pushNotification = (type, message) => {
    const id = Math.random().toString(36).slice(2);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);
  };

  const isMaintenance = (equipmentId, date) => {
    const eq = equipments.find((e) => e.id === equipmentId);
    if (!eq) return false;
    const d = isoDate(date);
    return eq.maintenance.includes(d);
  };

  const hasReservation = (equipmentId, date) => {
    const d = isoDate(date);
    return reservations.find((r) => r.equipmentId === equipmentId && r.date === d);
  };

  const detectConflict = (equipmentId, date) => {
    if (isMaintenance(equipmentId, date)) return 'maintenance';
    const existing = hasReservation(equipmentId, date);
    if (existing) return 'reserved';
    return null;
  };

  const createReservation = ({ equipmentId, date, projectId, siteId, operatorName }) => {
    const conflict = detectConflict(equipmentId, date);
    if (conflict) {
      pushNotification('error', `Cannot reserve: ${conflict === 'maintenance' ? 'Maintenance scheduled' : 'Already reserved'} on ${isoDate(date)}.`);
      return false;
    }
    const newRes = {
      id: Math.random().toString(36).slice(2),
      equipmentId,
      date: isoDate(date),
      projectId,
      siteId,
      operatorName,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [...prev, newRes]);
    pushNotification('success', 'Reservation created. Confirmation email sent.');
    // Simulate email
    console.log('[Email] Reservation confirmation sent:', newRes);
    // Simulate reminder scheduling (fires quickly for demo)
    setTimeout(() => {
      console.log('[Email] Reservation reminder sent:', newRes);
      pushNotification('info', 'Reminder email sent for upcoming reservation.');
    }, 3000);
    return true;
  };

  const updateReservationDate = (reservationId, newDate) => {
    setReservations((prev) => {
      const res = prev.find((r) => r.id === reservationId);
      if (!res) return prev;
      if (detectConflict(res.equipmentId, newDate)) {
        pushNotification('error', 'Cannot move: date conflicts with existing reservation or maintenance.');
        return prev;
      }
      return prev.map((r) => (r.id === reservationId ? { ...r, date: isoDate(newDate) } : r));
    });
  };

  const cancelReservation = (reservationId) => {
    setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    pushNotification('info', 'Reservation canceled. Notification sent.');
  };

  const filteredEquipments = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return equipments.filter((e) => {
      const matchesQuery = !q || e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q);
      const matchesType = filters.type === 'all' || e.type === filters.type;
      return matchesQuery && matchesType;
    });
  }, [equipments, filters]);

  useEffect(() => {
    // seed a sample reservation for demo
    const today = isoDate(new Date());
    if (reservations.length === 0) {
      setReservations([
        { id: 'r1', equipmentId: 'eq2', date: today, projectId: 'p2', siteId: 's2', operatorName: 'Sam O.', status: 'confirmed', createdAt: new Date().toISOString() },
      ]);
    }
  }, []); // eslint-disable-line

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Toolbar
            role={role}
            onRoleChange={setRole}
            weekStart={weekStart}
            onWeekChange={setWeekStart}
            filters={filters}
            onFiltersChange={setFilters}
            projects={projects}
            sites={sites}
          />
        </div>
      </header>

      {notifications.length > 0 && (
        <div aria-live="polite" className="mx-auto max-w-7xl p-4">
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-md border p-3 text-sm shadow-sm ${
                  n.type === 'error' ? 'border-red-300 bg-red-50 text-red-800' : n.type === 'success' ? 'border-green-300 bg-green-50 text-green-800' : 'border-blue-300 bg-blue-50 text-blue-800'
                }`}
                role="status"
              >
                {n.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 xl:col-span-3">
            <EquipmentPanel equipments={filteredEquipments} canEdit={canEdit} />
          </aside>
          <section className="lg:col-span-8 xl:col-span-9">
            <CalendarScheduler
              role={role}
              canEdit={canEdit}
              days={days}
              equipments={filteredEquipments}
              reservations={reservations}
              projects={projects}
              sites={sites}
              onCreateReservation={createReservation}
              onUpdateReservationDate={updateReservationDate}
              onCancelReservation={cancelReservation}
              isMaintenance={isMaintenance}
              hasReservation={hasReservation}
            />
          </section>
        </div>

        <section className="mt-8">
          <ReportsPanel equipments={equipments} reservations={reservations} days={days} />
        </section>
      </main>

      <footer className="mt-12 border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-neutral-500 flex items-center justify-between">
          <p>© {new Date().getFullYear()} BuildRight Resources</p>
          <p>Accessible, responsive scheduling system</p>
        </div>
      </footer>
    </div>
  );
}
