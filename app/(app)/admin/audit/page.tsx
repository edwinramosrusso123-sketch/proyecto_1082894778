'use client';
import { useEffect, useState } from 'react';
import {
  ScrollText, LogIn, LogOut, BedDouble, Users, CalendarPlus, CalendarX,
  UserPlus, Power, KeyRound, Database, Settings,
} from 'lucide-react';
import { PageHeader, Spinner, EmptyState } from '@/components/ui/primitives';
import { api } from '@/lib/clientApi';
import type { AuditEntry } from '@/lib/types';

const ICON: Record<string, React.ElementType> = {
  login: LogIn, logout: LogOut,
  create_room: BedDouble, update_room: BedDouble, delete_room: BedDouble, change_room_status: Settings,
  create_client: Users, update_client: Users, delete_client: Users,
  create_reservation: CalendarPlus, cancel_reservation: CalendarX,
  create_user: UserPlus, toggle_user: Power, change_password: KeyRound, bootstrap: Database,
};
const COLOR: Record<string, string> = {
  login: 'text-teal-600 bg-teal-50', logout: 'text-gray-500 bg-gray-100',
  create_reservation: 'text-teal-700 bg-teal-50', cancel_reservation: 'text-red-600 bg-red-50',
  delete_room: 'text-red-600 bg-red-50', delete_client: 'text-red-600 bg-red-50',
  bootstrap: 'text-gold-500 bg-gold-400/15',
};

function timeAgo(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);

  useEffect(() => {
    api<{ entries: AuditEntry[] }>('/api/audit').then((r) => setEntries(r.entries));
  }, []);

  return (
    <div>
      <PageHeader subtitle="Administración" title="Bitácora de auditoría" />

      {!entries ? (
        <div className="flex justify-center py-24 text-teal-600"><Spinner size={28} /></div>
      ) : entries.length === 0 ? (
        <EmptyState icon={<ScrollText size={36} />} title="Sin registros" hint="Las operaciones del sistema aparecerán aquí." />
      ) : (
        <div className="card p-2">
          <div className="relative">
            {entries.map((e, i) => {
              const Icon = ICON[e.action] ?? ScrollText;
              const color = COLOR[e.action] ?? 'text-ink-soft bg-sand-100';
              return (
                <div key={e.id ?? i} className="flex gap-4 px-4 py-3 transition hover:bg-sand-50/50">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon size={17} /></div>
                  <div className="min-w-0 flex-1 border-b border-[#f0ebe0] pb-3">
                    <p className="text-sm font-medium text-ink">{e.summary}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {e.user_email ?? 'sistema'} · {e.user_role ?? '—'} · {timeAgo(e.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
