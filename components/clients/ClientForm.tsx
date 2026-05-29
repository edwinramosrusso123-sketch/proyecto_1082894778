'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { Spinner } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/clientApi';
import type { Client } from '@/lib/types';

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const { toast } = useToast();
  const editing = !!client;
  const [form, setForm] = useState({
    name: client?.name ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    identification_number: client?.identification_number ?? '',
  });
  const [portal, setPortal] = useState(false);
  const [portalPassword, setPortalPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api(`/api/clients/${client!.id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast('Cliente actualizado', 'success');
        router.push(`/clients/${client!.id}`);
      } else {
        const body = portal
          ? { ...form, create_portal_access: true, portal_password: portalPassword }
          : form;
        await api('/api/clients', { method: 'POST', body: JSON.stringify(body) });
        toast('Cliente registrado', 'success');
        router.push('/clients');
      }
      router.refresh();
    } catch (err) {
      toast((err as Error).message, 'error');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card max-w-xl space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label-field">Nombre completo</label>
          <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Carlos García" />
        </div>
        <div>
          <label className="label-field">Correo electrónico</label>
          <input className="input-field" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cliente@correo.com" />
        </div>
        <div>
          <label className="label-field">Teléfono</label>
          <input className="input-field" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="3001234567" />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Número de documento</label>
          <input className="input-field" required value={form.identification_number} onChange={(e) => setForm({ ...form, identification_number: e.target.value })} placeholder="CC1234567890" />
        </div>
      </div>

      {!editing && (
        <div className="rounded-xl border border-[#ece5d6] bg-sand-50 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={portal} onChange={(e) => setPortal(e.target.checked)} className="h-4 w-4 accent-teal-600" />
            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><KeyRound size={15} className="text-gold-500" /> Dar acceso al portal del huésped</span>
          </label>
          {portal && (
            <div className="mt-3">
              <label className="label-field">Contraseña inicial</label>
              <input className="input-field" type="text" minLength={6} required={portal} value={portalPassword}
                onChange={(e) => setPortalPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              <p className="mt-1.5 text-xs text-ink-faint">El huésped podrá iniciar sesión con su correo y esta contraseña para ver sus reservas.</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? <Spinner /> : editing ? 'Guardar cambios' : 'Registrar cliente'}</button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">Cancelar</button>
      </div>
    </form>
  );
}
