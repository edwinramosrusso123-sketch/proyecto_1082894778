'use client';
import { useEffect, useState } from 'react';
import { Plus, ShieldCheck, Copy, Check, Power } from 'lucide-react';
import { PageHeader, Spinner, EmptyState } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useSession } from '@/components/SessionProvider';
import { api } from '@/lib/clientApi';
import type { SafeUser, Role } from '@/lib/types';

const ROLE_BADGE: Record<Role, string> = {
  superadmin: 'bg-gold-400/15 text-gold-500',
  recepcion: 'bg-teal-50 text-teal-700',
  cliente: 'bg-gray-100 text-gray-600',
};
const ROLE_LABEL: Record<Role, string> = { superadmin: 'SuperAdmin', recepcion: 'Recepción', cliente: 'Cliente' };

export default function UsersPage() {
  const session = useSession();
  const { toast } = useToast();
  const [users, setUsers] = useState<SafeUser[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'recepcion' as Role });
  const [creating, setCreating] = useState(false);
  const [tempPassword, setTempPassword] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => api<{ users: SafeUser[] }>('/api/users').then((r) => setUsers(r.users));
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api<{ user: SafeUser; tempPassword: string }>('/api/users', { method: 'POST', body: JSON.stringify(form) });
      setCreateOpen(false);
      setForm({ name: '', email: '', role: 'recepcion' });
      setTempPassword({ email: res.user.email, password: res.tempPassword });
      load();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setCreating(false); }
  }

  async function toggle(u: SafeUser) {
    try {
      await api(`/api/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ is_active: !u.is_active }) });
      toast(`${u.email} ${u.is_active ? 'suspendido' : 'activado'}`, 'success');
      load();
    } catch (e) { toast((e as Error).message, 'error'); }
  }

  return (
    <div>
      <PageHeader subtitle="Administración" title="Usuarios"
        action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus size={18} /> Nuevo usuario</button>} />

      {!users ? (
        <div className="flex justify-center py-24 text-teal-600"><Spinner size={28} /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={36} />} title="Sin usuarios" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#ece5d6] bg-sand-50 text-left text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-5 py-3 font-semibold">Usuario</th>
                <th className="px-5 py-3 font-semibold">Rol</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe0]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-sand-50/50">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-ink">{u.name}</p>
                    <p className="text-xs text-ink-faint">{u.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_BADGE[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.is_active ? 'text-green-600' : 'text-red-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      {u.is_active ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {u.id !== session?.userId ? (
                      <button onClick={() => toggle(u)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                        <Power size={14} /> {u.is_active ? 'Suspender' : 'Activar'}
                      </button>
                    ) : <span className="text-xs text-ink-faint">Tú</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Crear usuario */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo usuario">
        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="label-field">Nombre</label>
            <input className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Correo</label>
            <input className="input-field" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Rol</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              <option value="recepcion">Recepción</option>
              <option value="superadmin">SuperAdmin</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <p className="text-xs text-ink-faint">Se generará una contraseña temporal. El usuario deberá cambiarla en su primer ingreso.</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={creating} className="btn-primary">{creating ? <Spinner /> : 'Crear usuario'}</button>
          </div>
        </form>
      </Modal>

      {/* Contraseña temporal (una sola vez) */}
      <Modal open={!!tempPassword} onClose={() => { setTempPassword(null); setCopied(false); }} title="Usuario creado">
        {tempPassword && (
          <>
            <p className="text-sm text-ink-soft">Comparte estas credenciales con <b>{tempPassword.email}</b>. La contraseña no volverá a mostrarse.</p>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
              <code className="font-mono text-lg font-bold text-teal-800">{tempPassword.password}</code>
              <button onClick={() => { navigator.clipboard.writeText(tempPassword.password); setCopied(true); }}
                className="flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline">
                {copied ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar</>}
              </button>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => { setTempPassword(null); setCopied(false); }} className="btn-primary">Entendido</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
