'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, Mail, UserCircle } from 'lucide-react';
import { PageHeader, Spinner } from '@/components/ui/primitives';
import { useSession } from '@/components/SessionProvider';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/clientApi';

const ROLE_LABEL: Record<string, string> = { superadmin: 'Super Administrador', recepcion: 'Recepción', cliente: 'Huésped' };

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) { toast('Las contraseñas no coinciden', 'error'); return; }
    setLoading(true);
    try {
      await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: current, newPassword: next }) });
      toast('Contraseña actualizada', 'success');
      setCurrent(''); setNext(''); setConfirm('');
      router.refresh();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader subtitle="Cuenta" title="Mi perfil" />

      {session?.mustChangePassword && (
        <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Debes cambiar tu contraseña temporal antes de continuar usando el sistema.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-2xl font-bold text-white">
              {session?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="display text-xl font-semibold text-ink">{session?.name}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700"><ShieldCheck size={12} /> {ROLE_LABEL[session?.role ?? '']}</span>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-center gap-2.5 text-ink-soft"><Mail size={15} className="text-ink-faint" /> {session?.email}</p>
            <p className="flex items-center gap-2.5 text-ink-soft"><UserCircle size={15} className="text-ink-faint" /> {ROLE_LABEL[session?.role ?? '']}</p>
          </div>
        </div>

        <form onSubmit={changePassword} className="card p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-ink"><Lock size={18} className="text-teal-600" /> Cambiar contraseña</h2>
          <p className="mb-5 text-sm text-ink-faint">Verifica tu contraseña actual y define una nueva.</p>
          <div className="space-y-4">
            <div>
              <label className="label-field">Contraseña actual</label>
              <input type="password" required className="input-field" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div>
              <label className="label-field">Nueva contraseña</label>
              <input type="password" required minLength={6} className="input-field" value={next} onChange={(e) => setNext(e.target.value)} />
            </div>
            <div>
              <label className="label-field">Confirmar nueva contraseña</label>
              <input type="password" required minLength={6} className="input-field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <Spinner /> : 'Actualizar contraseña'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
