'use client';
import { useEffect, useState } from 'react';
import { CalendarHeart, MapPin, Moon } from 'lucide-react';
import { PageHeader, Spinner, Stagger, StaggerItem, ReservationStatusBadge, RoomTypeTag, EmptyState } from '@/components/ui/primitives';
import { useSession } from '@/components/SessionProvider';
import { api } from '@/lib/clientApi';
import { formatCOP, formatDateLong } from '@/lib/dateUtils';
import type { ReservationWithDetails } from '@/lib/types';

export default function MyReservationsPage() {
  const session = useSession();
  const [reservations, setReservations] = useState<ReservationWithDetails[] | null>(null);

  useEffect(() => {
    api<{ reservations: ReservationWithDetails[] }>('/api/reservations/my').then((r) => setReservations(r.reservations));
  }, []);

  const active = reservations?.filter((r) => r.status === 'activa') ?? [];

  return (
    <div>
      <PageHeader subtitle={`Hola, ${session?.name?.split(' ')[0] ?? ''}`} title="Mis reservas" />

      {!reservations ? (
        <div className="flex justify-center py-24 text-teal-600"><Spinner size={28} /></div>
      ) : reservations.length === 0 ? (
        <EmptyState icon={<CalendarHeart size={36} />} title="Aún no tienes reservas" hint="Cuando recepción registre una reserva a tu nombre, aparecerá aquí." />
      ) : (
        <>
          {active.length > 0 && (
            <div className="card hotel-pattern mb-6 bg-[#0c3f3c] p-6 text-white">
              <p className="text-sm text-teal-100/70">Tu próxima estadía</p>
              <p className="display mt-1 text-3xl font-semibold">Habitación {active[0].room.room_number}</p>
              <p className="mt-2 flex items-center gap-2 text-teal-100/80"><MapPin size={15} /> {formatDateLong(active[0].check_in)} → {formatDateLong(active[0].check_out)}</p>
            </div>
          )}
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {reservations.map((r) => (
              <StaggerItem key={r.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="display text-2xl font-semibold text-ink">Hab. {r.room.room_number}</span>
                    <RoomTypeTag type={r.room.type} />
                  </div>
                  <ReservationStatusBadge status={r.status} />
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-ink-soft">
                  <p className="flex items-center gap-2"><MapPin size={15} className="text-ink-faint" /> {formatDateLong(r.check_in)} → {formatDateLong(r.check_out)}</p>
                  <p className="flex items-center gap-2"><Moon size={15} className="text-ink-faint" /> {r.nights} noches</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#f0ebe0] pt-3">
                  <span className="text-xs text-ink-faint">Total</span>
                  <span className="display text-lg font-semibold text-teal-700">{formatCOP(r.total_amount)}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </>
      )}
    </div>
  );
}
