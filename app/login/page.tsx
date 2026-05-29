'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { HotelLogo } from '@/components/HotelLogo';
import { Spinner } from '@/components/ui/primitives';
import { api } from '@/lib/clientApi';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { redirectTo } = await api<{ redirectTo: string }>('/api/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  const fill = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Panel izquierdo — escena de hotel */}
      <div className="hotel-pattern relative hidden flex-col justify-between overflow-hidden bg-[#0c3f3c] p-12 text-white lg:flex">
        <div className="grain absolute inset-0 opacity-[0.12]" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <HotelLogo size={44} className="text-gold-400" />
          <span className="display text-2xl font-semibold">HotelApp</span>
        </div>

        <div className="relative max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="display text-5xl font-semibold leading-[1.05]"
          >
            Gestión hotelera<br /><span className="text-gold-400">inteligente.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 text-lg leading-relaxed text-teal-100/80"
          >
            Habitaciones, huéspedes y reservas en un solo lugar. Disponibilidad en tiempo real, ocupación al instante.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-8 flex items-center gap-2 text-sm text-teal-200/60"
          >
            <Sparkles size={16} className="text-gold-400" /> Recepción · Suites · Ocupación
          </motion.div>
        </div>

        <p className="relative text-sm text-teal-200/50">© 2026 HotelApp — Edwin Ramos</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex items-center justify-center bg-sand-50 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <HotelLogo size={44} className="text-teal-600" />
          </div>
          <h2 className="display text-3xl font-semibold text-ink">Bienvenido de nuevo</h2>
          <p className="mt-1.5 text-sm text-ink-faint">Ingresa tus credenciales para continuar.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label-field">Correo electrónico</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com" className="input-field pl-10" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="label-field">Contraseña</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="input-field pl-10" autoComplete="current-password" />
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </motion.p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <Spinner /> : <>Ingresar <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-[#ece5d6] bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Cuentas de demostración</p>
            <div className="space-y-1.5 text-sm">
              {[
                ['SuperAdmin', 'admin@hotelapp.com', 'admin123'],
                ['Recepción', 'recepcion@hotelapp.com', 'recepcion123'],
                ['Cliente', 'carlos.garcia@example.com', 'cliente123'],
              ].map(([role, e, p]) => (
                <button key={e} type="button" onClick={() => fill(e, p)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition hover:bg-sand-50">
                  <span className="font-medium text-ink-soft">{role}</span>
                  <span className="font-mono text-xs text-teal-600">{e}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
