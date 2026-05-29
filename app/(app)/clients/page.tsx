'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, Phone, Mail, KeyRound, ChevronRight } from 'lucide-react';
import { PageHeader, Spinner, Stagger, StaggerItem, EmptyState } from '@/components/ui/primitives';
import { api } from '@/lib/clientApi';
import type { Client } from '@/lib/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      api<{ clients: Client[] }>(`/api/clients?q=${encodeURIComponent(query)}`).then((r) => setClients(r.clients));
    }, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div>
      <PageHeader subtitle="Huéspedes" title="Clientes"
        action={<Link href="/clients/new" className="btn-primary"><Plus size={18} /> Nuevo cliente</Link>} />

      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input className="input-field pl-10" placeholder="Buscar por nombre, documento o correo..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {!clients ? (
        <div className="flex justify-center py-24 text-teal-600"><Spinner size={28} /></div>
      ) : clients.length === 0 ? (
        <EmptyState icon={<Users size={36} />} title="No hay clientes" hint="Registra tu primer huésped para empezar a crear reservas." />
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <StaggerItem key={c.id}>
              <Link href={`/clients/${c.id}`} className="card group flex items-center gap-4 p-5 transition hover:shadow-lift">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-lg font-bold text-white">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold text-ink">{c.name}</p>
                    {c.user_id && <KeyRound size={13} className="shrink-0 text-gold-500" />}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-faint"><Mail size={12} /> {c.email}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-ink-faint">
                    <span className="font-mono">{c.identification_number}</span>
                    {c.phone && <><span className="mx-1">·</span><Phone size={12} /> {c.phone}</>}
                  </p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
