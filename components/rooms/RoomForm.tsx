'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/clientApi';
import type { Room, RoomType, RoomStatus } from '@/lib/types';

export function RoomForm({ room }: { room?: Room }) {
  const router = useRouter();
  const { toast } = useToast();
  const editing = !!room;
  const [form, setForm] = useState({
    room_number: room?.room_number ?? '',
    type: (room?.type ?? 'simple') as RoomType,
    status: (room?.status ?? 'disponible') as RoomStatus,
    price_per_night: room?.price_per_night ?? 120000,
    description: room?.description ?? '',
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api(`/api/rooms/${room!.id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast('Habitación actualizada', 'success');
      } else {
        await api('/api/rooms', { method: 'POST', body: JSON.stringify(form) });
        toast('Habitación creada', 'success');
      }
      router.push('/rooms');
      router.refresh();
    } catch (err) {
      toast((err as Error).message, 'error');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card max-w-xl space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Número de habitación</label>
          <input className="input-field" required value={form.room_number}
            onChange={(e) => setForm({ ...form, room_number: e.target.value })} placeholder="Ej. 101" />
        </div>
        <div>
          <label className="label-field">Precio por noche (COP)</label>
          <input className="input-field" type="number" min={1} required value={form.price_per_night}
            onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) })} />
        </div>
        <div>
          <label className="label-field">Tipo</label>
          <select className="input-field" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as RoomType })}>
            <option value="simple">Simple</option>
            <option value="doble">Doble</option>
            <option value="suite">Suite</option>
          </select>
        </div>
        <div>
          <label className="label-field">Estado</label>
          <select className="input-field" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as RoomStatus })}>
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label-field">Descripción</label>
        <textarea className="input-field min-h-[90px] resize-y" value={form.description ?? ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalles de la habitación..." />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Spinner /> : editing ? 'Guardar cambios' : 'Crear habitación'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">Cancelar</button>
      </div>
    </form>
  );
}
