'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BedDouble, DoorOpen, Wrench, CalendarCheck, TrendingUp, ArrowUpRight, Hotel } from 'lucide-react';
import { PageHeader, Spinner, Stagger, StaggerItem, ReservationStatusBadge, EmptyState } from '@/components/ui/primitives';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { api } from '@/lib/clientApi';
import { formatCOP, formatDateShort } from '@/lib/dateUtils';
import type { DashboardData } from '@/lib/types';

const KPIS = [
  { key: 'disponible', label: 'Disponibles', icon: DoorOpen, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'ocupada', label: 'Ocupadas', icon: BedDouble, color: 'text-red-600', bg: 'bg-red-50' },
  { key: 'mantenimiento', label: 'Mantenimiento', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ data: DashboardData }>('/api/dashboard').then((r) => setData(r.data)).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <div className="flex justify-center py-24 text-teal-600"><Spinner size={28} /></div>;

  const avgOcc = Math.round(data.weeklyOccupancy.reduce((a, d) => a + d.occupancy, 0) / (data.weeklyOccupancy.length || 1));

  return (
    <div>
      <PageHeader subtitle="Panel de control" title="Resumen del hotel" />

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <StaggerItem key={k.key} className="card p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${k.bg} ${k.color}`}>
                <Icon size={20} />
              </div>
              <p className="display text-4xl font-semibold text-ink">{data.rooms[k.key as keyof typeof data.rooms]}</p>
              <p className="mt-1 text-sm font-medium text-ink-faint">{k.label}</p>
            </StaggerItem>
          );
        })}
        <StaggerItem className="card bg-[#0c3f3c] p-5 text-white lg:hidden xl:block">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/20 text-gold-400">
            <CalendarCheck size={20} />
          </div>
          <p className="display text-4xl font-semibold">{data.reservationsToday}</p>
          <p className="mt-1 text-sm font-medium text-teal-100/70">Reservas hoy</p>
        </StaggerItem>
      </Stagger>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Gráfica */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="display text-xl font-semibold text-ink">Ocupación semanal</h2>
              <p className="text-sm text-ink-faint">Porcentaje de habitaciones ocupadas — últimos 7 días</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">
              <TrendingUp size={15} /> {avgOcc}% prom.
            </div>
          </div>
          <OccupancyChart data={data.weeklyOccupancy} />
        </div>

        {/* Reservas hoy + total */}
        <div className="space-y-5">
          <div className="card hotel-pattern bg-[#0c3f3c] p-6 text-white">
            <Hotel size={22} className="mb-3 text-gold-400" />
            <p className="text-sm text-teal-100/70">Reservas activas hoy</p>
            <p className="display mt-1 text-5xl font-semibold">{data.reservationsToday}</p>
            <p className="mt-3 text-sm text-teal-100/60">{data.activeReservations} reservas activas en total · {data.rooms.total} habitaciones</p>
          </div>
        </div>
      </div>

      {/* Reservas recientes */}
      <div className="card mt-5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-xl font-semibold text-ink">Reservas recientes</h2>
          <Link href="/reservations" className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700">
            Ver todas <ArrowUpRight size={15} />
          </Link>
        </div>
        {data.recentReservations.length === 0 ? (
          <EmptyState title="Aún no hay reservas" hint="Crea la primera reserva desde la sección Reservas." />
        ) : (
          <div className="divide-y divide-[#f0ebe0]">
            {data.recentReservations.map((r) => (
              <Link key={r.id} href={`/reservations`} className="flex items-center justify-between gap-4 py-3 transition hover:bg-sand-50/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-sm font-bold text-teal-700">
                    {r.room.room_number}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.client.name}</p>
                    <p className="text-xs text-ink-faint">{formatDateShort(r.check_in)} – {formatDateShort(r.check_out)} · {r.nights} noches</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm font-semibold text-ink sm:block">{formatCOP(r.total_amount)}</span>
                  <ReservationStatusBadge status={r.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
