import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, CalendarCheck } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { getRoomById, getReservations } from '@/lib/dataService';
import { PageHeader, RoomStatusBadge, RoomTypeTag, ReservationStatusBadge, EmptyState } from '@/components/ui/primitives';
import { DeleteRoomButton } from '@/components/rooms/DeleteRoomButton';
import { formatCOP, formatDateLong } from '@/lib/dateUtils';

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role === 'cliente') redirect('/dashboard');
  const { id } = await params;
  const room = await getRoomById(id);
  if (!room) notFound();
  const reservations = await getReservations({ roomId: id });
  const isAdmin = session.role === 'superadmin';

  return (
    <div>
      <Link href="/rooms" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-teal-600"><ArrowLeft size={16} /> Habitaciones</Link>
      <PageHeader subtitle={`Habitación ${room.type}`} title={`Habitación ${room.room_number}`}
        action={isAdmin && (
          <div className="flex gap-3">
            <Link href={`/rooms/${room.id}/edit`} className="btn-ghost"><Pencil size={16} /> Editar</Link>
            <DeleteRoomButton id={room.id} number={room.room_number} />
          </div>
        )} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <RoomTypeTag type={room.type} />
            <RoomStatusBadge status={room.status} />
          </div>
          <p className="display mt-5 text-4xl font-semibold text-teal-700">{formatCOP(room.price_per_night)}</p>
          <p className="text-sm text-ink-faint">por noche</p>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">{room.description || 'Sin descripción.'}</p>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="display mb-4 text-xl font-semibold text-ink">Historial de reservas</h2>
          {reservations.length === 0 ? (
            <EmptyState icon={<CalendarCheck size={32} />} title="Sin reservas" hint="Esta habitación aún no tiene reservas registradas." />
          ) : (
            <div className="divide-y divide-[#f0ebe0]">
              {reservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.client.name}</p>
                    <p className="text-xs text-ink-faint">{formatDateLong(r.check_in)} → {formatDateLong(r.check_out)} · {r.nights} noches</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-sm font-semibold text-ink sm:block">{formatCOP(r.total_amount)}</span>
                    <ReservationStatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
