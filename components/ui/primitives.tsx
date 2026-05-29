'use client';
import { motion } from 'framer-motion';
import type { RoomStatus, ReservationStatus, RoomType } from '@/lib/types';

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
    />
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {subtitle && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">{subtitle}</p>}
        <h1 className="display text-3xl font-semibold text-ink md:text-[2.1rem]">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddd2bd] bg-white/60 px-6 py-16 text-center">
      {icon && <div className="mb-3 text-ink-faint">{icon}</div>}
      <p className="text-base font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Stagger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Badges de estado ─────────────────────────────────────────
const ROOM_STATUS: Record<RoomStatus, { label: string; cls: string; dot: string }> = {
  disponible: { label: 'Disponible', cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  ocupada: { label: 'Ocupada', cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  mantenimiento: { label: 'Mantenimiento', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const s = ROOM_STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

const RES_STATUS: Record<ReservationStatus, { label: string; cls: string }> = {
  activa: { label: 'Activa', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  completada: { label: 'Completada', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  cancelada: { label: 'Cancelada', cls: 'bg-red-50 text-red-700 border-red-200' },
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const s = RES_STATUS[status];
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

const ROOM_TYPE: Record<RoomType, string> = { simple: 'Simple', doble: 'Doble', suite: 'Suite' };
export function RoomTypeTag({ type }: { type: RoomType }) {
  return <span className="inline-flex items-center rounded-md bg-sand-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">{ROOM_TYPE[type]}</span>;
}
