'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, BedDouble, Receipt, CheckCircle2 } from 'lucide-react';
import { ClientSearchInput } from '@/components/clients/ClientSearchInput';
import { Spinner, RoomTypeTag } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/clientApi';
import { calculateNights, formatCOP, todayISO } from '@/lib/dateUtils';
import type { Client, Room } from '@/lib/types';

export function ReservationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const today = todayISO();

  const [client, setClient] = useState<Client | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [roomId, setRoomId] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validRange = checkIn && checkOut && checkOut > checkIn && checkIn >= today;

  // Cargar habitaciones disponibles al cambiar fechas
  useEffect(() => {
    setRoomId('');
    if (!validRange) { setRooms(null); return; }
    setLoadingRooms(true);
    api<{ rooms: Room[] }>(`/api/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`)
      .then((r) => setRooms(r.rooms))
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoadingRooms(false));
  }, [checkIn, checkOut, validRange, toast]);

  const nights = useMemo(() => (validRange ? calculateNights(checkIn, checkOut) : 0), [checkIn, checkOut, validRange]);
  const selectedRoom = rooms?.find((r) => r.id === roomId);
  const total = selectedRoom ? nights * selectedRoom.price_per_night : 0;
  const canSubmit = client && validRange && roomId && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await api('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({ client_id: client!.id, room_id: roomId, check_in: checkIn, check_out: checkOut }),
      });
      toast('Reserva creada · habitación marcada como ocupada', 'success');
      router.push('/reservations');
      router.refresh();
    } catch (err) {
      toast((err as Error).message, 'error');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        {/* Cliente */}
        <section className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-soft"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs text-white">1</span> Cliente</h2>
          <ClientSearchInput selected={client} onSelect={setClient} />
        </section>

        {/* Fechas */}
        <section className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-soft"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs text-white">2</span> Fechas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Entrada (check-in)</label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input type="date" min={today} className="input-field pl-10" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label-field">Salida (check-out)</label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input type="date" min={checkIn || today} className="input-field pl-10" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>
          </div>
          {checkIn && checkOut && checkOut <= checkIn && <p className="mt-2 text-sm text-red-600">La salida debe ser posterior a la entrada.</p>}
        </section>

        {/* Habitación */}
        <section className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-soft"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs text-white">3</span> Habitación disponible</h2>
          {!validRange ? (
            <p className="rounded-xl bg-sand-50 px-4 py-6 text-center text-sm text-ink-faint">Selecciona las fechas para ver las habitaciones disponibles.</p>
          ) : loadingRooms ? (
            <div className="flex justify-center py-6 text-teal-600"><Spinner size={24} /></div>
          ) : rooms && rooms.length === 0 ? (
            <p className="rounded-xl bg-amber-50 px-4 py-6 text-center text-sm font-medium text-amber-700">No hay habitaciones disponibles para esas fechas.</p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {rooms?.map((room) => (
                <button type="button" key={room.id} onClick={() => setRoomId(room.id)}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${roomId === room.id ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20' : 'border-[#ddd2bd] bg-white hover:border-teal-300'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="display text-lg font-semibold text-ink">{room.room_number}</span>
                      <RoomTypeTag type={room.type} />
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-teal-700">{formatCOP(room.price_per_night)}/noche</p>
                  </div>
                  {roomId === room.id ? <CheckCircle2 size={20} className="text-teal-600" /> : <BedDouble size={20} className="text-ink-faint" />}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Resumen */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="card overflow-hidden">
          <div className="hotel-pattern bg-[#0c3f3c] p-6 text-white">
            <Receipt size={22} className="mb-2 text-gold-400" />
            <h3 className="display text-xl font-semibold">Resumen de reserva</h3>
          </div>
          <div className="space-y-3 p-6">
            <Row label="Huésped" value={client?.name ?? '—'} />
            <Row label="Habitación" value={selectedRoom ? `${selectedRoom.room_number} (${selectedRoom.type})` : '—'} />
            <Row label="Entrada" value={checkIn || '—'} />
            <Row label="Salida" value={checkOut || '—'} />
            <Row label="Noches" value={nights ? String(nights) : '—'} />
            <Row label="Precio/noche" value={selectedRoom ? formatCOP(selectedRoom.price_per_night) : '—'} />
            <div className="my-3 h-px bg-[#f0ebe0]" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Total</span>
              <span className="display text-2xl font-semibold text-teal-700">{total ? formatCOP(total) : '—'}</span>
            </div>
            <button type="submit" disabled={!canSubmit} className="btn-primary mt-3 w-full py-3">
              {submitting ? <Spinner /> : 'Confirmar reserva'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-faint">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
