'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, BedDouble, Wrench, DoorOpen, Eye, Pencil, MoreVertical } from 'lucide-react';
import { PageHeader, Spinner, Stagger, StaggerItem, RoomStatusBadge, RoomTypeTag, EmptyState } from '@/components/ui/primitives';
import { useSession } from '@/components/SessionProvider';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/clientApi';
import { formatCOP } from '@/lib/dateUtils';
import type { Room, RoomStatus, RoomType } from '@/lib/types';

const STATUS_FILTERS: { value: RoomStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'disponible', label: 'Disponibles' },
  { value: 'ocupada', label: 'Ocupadas' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
];
const TYPE_FILTERS: { value: RoomType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'simple', label: 'Simple' },
  { value: 'doble', label: 'Doble' },
  { value: 'suite', label: 'Suite' },
];

export default function RoomsPage() {
  const session = useSession();
  const { toast } = useToast();
  const isAdmin = session?.role === 'superadmin';
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [status, setStatus] = useState<RoomStatus | 'all'>('all');
  const [type, setType] = useState<RoomType | 'all'>('all');
  const [menuId, setMenuId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (type !== 'all') params.set('type', type);
    const { rooms } = await api<{ rooms: Room[] }>(`/api/rooms?${params}`);
    setRooms(rooms);
  }, [status, type]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(room: Room, newStatus: RoomStatus) {
    setMenuId(null);
    try {
      await api(`/api/rooms/${room.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      toast(`Habitación ${room.room_number} → ${newStatus}`, 'success');
      load();
    } catch (e) { toast((e as Error).message, 'error'); }
  }

  return (
    <div>
      <PageHeader subtitle="Inventario" title="Habitaciones"
        action={isAdmin && (
          <Link href="/rooms/new" className="btn-primary"><Plus size={18} /> Nueva habitación</Link>
        )} />

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setStatus(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${status === f.value ? 'bg-teal-500 text-white shadow-soft' : 'bg-white text-ink-soft hover:bg-sand-100'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-[#ddd2bd]" />
        <select value={type} onChange={(e) => setType(e.target.value as RoomType | 'all')}
          className="rounded-full border border-[#ddd2bd] bg-white px-3.5 py-1.5 text-sm font-medium text-ink-soft outline-none">
          {TYPE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {!rooms ? (
        <div className="flex justify-center py-24 text-teal-600"><Spinner size={28} /></div>
      ) : rooms.length === 0 ? (
        <EmptyState icon={<BedDouble size={36} />} title="No hay habitaciones" hint="Ajusta los filtros o crea una nueva habitación." />
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <StaggerItem key={room.id} className="card group relative overflow-hidden p-5">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-teal-50 opacity-60 transition group-hover:scale-125" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="display text-3xl font-semibold text-ink">{room.room_number}</span>
                    <RoomTypeTag type={room.type} />
                  </div>
                  <p className="mt-2 text-sm text-ink-faint line-clamp-2 max-w-[90%]">{room.description || 'Sin descripción.'}</p>
                </div>
                {(isAdmin || true) && (
                  <div className="relative">
                    <button onClick={() => setMenuId(menuId === room.id ? null : room.id)}
                      className="rounded-lg p-1.5 text-ink-faint hover:bg-sand-100"><MoreVertical size={18} /></button>
                    {menuId === room.id && (
                      <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-[#ece5d6] bg-white p-1.5 shadow-lift">
                        <Link href={`/rooms/${room.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sand-50"><Eye size={15} /> Ver detalle</Link>
                        {isAdmin && <Link href={`/rooms/${room.id}/edit`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sand-50"><Pencil size={15} /> Editar</Link>}
                        <div className="my-1 h-px bg-[#f0ebe0]" />
                        <p className="px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-ink-faint">Cambiar estado</p>
                        <button onClick={() => changeStatus(room, 'disponible')} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-sand-50"><DoorOpen size={15} className="text-green-600" /> Disponible</button>
                        <button onClick={() => changeStatus(room, 'mantenimiento')} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-sand-50"><Wrench size={15} className="text-amber-600" /> Mantenimiento</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative mt-5 flex items-end justify-between">
                <div>
                  <p className="display text-xl font-semibold text-teal-700">{formatCOP(room.price_per_night)}</p>
                  <p className="text-xs text-ink-faint">por noche</p>
                </div>
                <RoomStatusBadge status={room.status} />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
