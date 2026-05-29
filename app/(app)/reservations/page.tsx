'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, CalendarCheck, XCircle, BedDouble } from 'lucide-react';
import { PageHeader, Spinner, Stagger, StaggerItem, ReservationStatusBadge, RoomTypeTag, EmptyState } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/clientApi';
import { formatCOP, formatDateLong } from '@/lib/dateUtils';
import type { ReservationWithDetails, ReservationStatus } from '@/lib/types';

const FILTERS: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'activa', label: 'Activas' },
  { value: 'completada', label: 'Completadas' },
  { value: 'cancelada', label: 'Canceladas' },
];

export default function ReservationsPage() {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<ReservationWithDetails[] | null>(null);
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all');
  const [cancelTarget, setCancelTarget] = useState<ReservationWithDetails | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    const params = filter === 'all' ? '' : `?status=${filter}`;
    const { reservations } = await api<{ reservations: ReservationWithDetails[] }>(`/api/reservations${params}`);
    setReservations(reservations);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function doCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api(`/api/reservations/${cancelTarget.id}/cancel`, { method: 'POST' });
      toast(`Reserva cancelada · Hab. ${cancelTarget.room.room_number} liberada`, 'success');
      setCancelTarget(null);
      load();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setCancelling(false); }
  }

  return (
    <div>
      <PageHeader subtitle="Operación" title="Reservas"
        action={<Link href="/reservations/new" className="btn-primary"><Plus size={18} /> Nueva reserva</Link>} />

      <div className="mb-6 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${filter === f.value ? 'bg-teal-500 text-white shadow-soft' : 'bg-white text-ink-soft hover:bg-sand-100'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {!reservations ? (
        <div className="flex justify-center py-24 text-teal-600"><Spinner size={28} /></div>
      ) : reservations.length === 0 ? (
        <EmptyState icon={<CalendarCheck size={36} />} title="No hay reservas" hint="No se encontraron reservas para este filtro." />
      ) : (
        <Stagger className="space-y-3">
          {reservations.map((r) => (
            <StaggerItem key={r.id}>
              <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-base font-bold text-white">{r.room.room_number}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink">{r.client.name}</p>
                      <RoomTypeTag type={r.room.type} />
                    </div>
                    <p className="mt-0.5 text-sm text-ink-faint">{formatDateLong(r.check_in)} → {formatDateLong(r.check_out)} · {r.nights} noches</p>
                    <p className="text-xs text-ink-faint">Doc: {r.client.identification_number}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="display text-lg font-semibold text-teal-700">{formatCOP(r.total_amount)}</p>
                    <ReservationStatusBadge status={r.status} />
                  </div>
                  {r.status === 'activa' && (
                    <button onClick={() => setCancelTarget(r)} className="btn-danger"><XCircle size={16} /> Cancelar</button>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancelar reserva">
        {cancelTarget && (
          <>
            <p className="text-sm text-ink-soft">¿Cancelar la reserva de <b>{cancelTarget.client.name}</b> en la habitación <b>{cancelTarget.room.room_number}</b>? La habitación volverá a estar <b>disponible</b>.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setCancelTarget(null)} className="btn-ghost">Volver</button>
              <button onClick={doCancel} disabled={cancelling} className="btn-danger">{cancelling ? <Spinner /> : 'Sí, cancelar'}</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
