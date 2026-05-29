'use client';
import { useEffect, useState } from 'react';
import { Database, CheckCircle2, RefreshCw, Sprout } from 'lucide-react';
import { PageHeader, Spinner } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/clientApi';

export default function DbSetupPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'seed' | 'live' | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<Record<string, number> | null>(null);

  const checkMode = () => api<{ mode: 'seed' | 'live' }>('/api/system/mode').then((r) => setMode(r.mode));
  useEffect(() => { checkMode(); }, []);

  async function runSeed() {
    setSeeding(true);
    try {
      const res = await api<{ counts: Record<string, number> }>('/api/system/seed', { method: 'POST' });
      setResult(res.counts);
      toast('Seed aplicado correctamente', 'success');
      checkMode();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setSeeding(false); }
  }

  return (
    <div>
      <PageHeader subtitle="Administración" title="Configuración de base de datos" />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600"><Database size={22} /></div>
            <div>
              <h2 className="font-semibold text-ink">Estado de conexión</h2>
              <p className="text-sm text-ink-faint">Supabase Postgres</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-sand-50 px-4 py-3">
            <span className="text-sm font-medium text-ink-soft">Modo del sistema</span>
            {mode === null ? <Spinner size={16} /> : (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${mode === 'live' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                <CheckCircle2 size={13} /> {mode === 'live' ? 'LIVE (conectado)' : 'SEED'}
              </span>
            )}
          </div>
          <button onClick={checkMode} className="btn-ghost mt-4 w-full"><RefreshCw size={16} /> Volver a verificar</button>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-500"><Sprout size={22} /></div>
            <div>
              <h2 className="font-semibold text-ink">Cargar datos de ejemplo</h2>
              <p className="text-sm text-ink-faint">Admin, habitaciones, clientes y reservas</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-soft">Ejecuta el seed idempotente: crea las cuentas base, las habitaciones demo y reservas de ejemplo si aún no existen.</p>
          <button onClick={runSeed} disabled={seeding} className="btn-primary mt-4 w-full">{seeding ? <Spinner /> : 'Aplicar seed'}</button>
          {result && (
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {Object.entries(result).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-sand-50 py-2">
                  <p className="display text-xl font-semibold text-teal-700">{v}</p>
                  <p className="text-[0.7rem] uppercase tracking-wide text-ink-faint">{k}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
