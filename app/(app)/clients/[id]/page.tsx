import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Mail, Phone, Fingerprint, KeyRound, CalendarPlus, CalendarCheck } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { getClientById } from '@/lib/dataService';
import { PageHeader, ReservationStatusBadge, EmptyState } from '@/components/ui/primitives';
import { DeleteClientButton } from '@/components/clients/DeleteClientButton';
import { formatCOP, formatDateLong } from '@/lib/dateUtils';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role === 'cliente') redirect('/dashboard');
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();
  const isAdmin = session.role === 'superadmin';
  const active = client.reservations.filter((r) => r.status === 'activa');
  const totalSpent = client.reservations.filter((r) => r.status !== 'cancelada').reduce((a, r) => a + r.total_amount, 0);

  return (
    <div>
      <Link href="/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-teal-600"><ArrowLeft size={16} /> Clientes</Link>
      <PageHeader subtitle="Perfil del huésped" title={client.name}
        action={
          <div className="flex gap-3">
            <Link href={`/clients/${client.id}/edit`} className="btn-ghost"><Pencil size={16} /> Editar</Link>
            {isAdmin && <DeleteClientButton id={client.id} name={client.name} />}
          </div>
        } />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-2xl font-bold text-white">{client.name.charAt(0)}</div>
              <div>
                <p className="font-semibold text-ink">{client.name}</p>
                {client.user_id && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gold-400/15 px-2 py-0.5 text-xs font-semibold text-gold-500"><KeyRound size={11} /> Portal activo</span>}
              </div>
            </div>
            <div className="mt-5 space-y-2.5 text-sm">
              <p className="flex items-center gap-2.5 text-ink-soft"><Mail size={15} className="text-ink-faint" /> {client.email}</p>
              {client.phone && <p className="flex items-center gap-2.5 text-ink-soft"><Phone size={15} className="text-ink-faint" /> {client.phone}</p>}
              <p className="flex items-center gap-2.5 text-ink-soft"><Fingerprint size={15} className="text-ink-faint" /> <span className="font-mono">{client.identification_number}</span></p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4"><p className="display text-2xl font-semibold text-ink">{active.length}</p><p className="text-xs text-ink-faint">Reservas activas</p></div>
            <div className="card p-4"><p className="display text-2xl font-semibold text-teal-700">{formatCOP(totalSpent)}</p><p className="text-xs text-ink-faint">Total histórico</p></div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-xl font-semibold text-ink">Historial de reservas</h2>
            <Link href="/reservations/new" className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"><CalendarPlus size={16} /> Nueva</Link>
          </div>
          {client.reservations.length === 0 ? (
            <EmptyState icon={<CalendarCheck size={32} />} title="Sin reservas" hint="Este huésped aún no tiene reservas." />
          ) : (
            <div className="divide-y divide-[#f0ebe0]">
              {client.reservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100 text-sm font-bold text-teal-700">{r.room.room_number}</div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Hab. {r.room.room_number} · {r.room.type}</p>
                      <p className="text-xs text-ink-faint">{formatDateLong(r.check_in)} → {formatDateLong(r.check_out)} · {r.nights} noches</p>
                    </div>
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
