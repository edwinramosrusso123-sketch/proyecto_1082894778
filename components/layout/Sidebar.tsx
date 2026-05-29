'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, BedDouble, Users, CalendarCheck, ShieldCheck,
  ScrollText, UserCircle, LogOut, Menu, X, CalendarHeart,
} from 'lucide-react';
import { HotelLogo } from '@/components/HotelLogo';
import { api } from '@/lib/clientApi';
import type { Role } from '@/lib/types';

interface NavItem { href: string; label: string; icon: React.ElementType }

const STAFF: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rooms', label: 'Habitaciones', icon: BedDouble },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/reservations', label: 'Reservas', icon: CalendarCheck },
];
const ADMIN: NavItem[] = [
  { href: '/admin/users', label: 'Usuarios', icon: ShieldCheck },
  { href: '/admin/audit', label: 'Auditoría', icon: ScrollText },
];
const CLIENT: NavItem[] = [
  { href: '/my-reservations', label: 'Mis Reservas', icon: CalendarHeart },
];

export function Sidebar({ role, name, email }: { role: Role; name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const main = role === 'cliente' ? CLIENT : STAFF;
  const showAdmin = role === 'superadmin';

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={() => setOpen(false)}
        className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition
          ${active ? 'bg-white/10 text-white' : 'text-teal-100/70 hover:bg-white/5 hover:text-white'}`}
      >
        {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold-400" />}
        <Icon size={18} className={active ? 'text-gold-400' : 'text-teal-200/60 group-hover:text-teal-100'} />
        {item.label}
      </Link>
    );
  };

  const roleLabel = role === 'superadmin' ? 'Super Administrador' : role === 'recepcion' ? 'Recepción' : 'Huésped';

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <HotelLogo size={38} className="text-gold-400" />
        <div>
          <p className="display text-xl font-semibold leading-none text-white">HotelApp</p>
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.2em] text-teal-200/60">Concierge Suite</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {main.map((i) => <NavLink key={i.href} item={i} />)}
        {showAdmin && (
          <>
            <p className="px-3.5 pb-1 pt-5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-teal-200/40">Administración</p>
            {ADMIN.map((i) => <NavLink key={i.href} item={i} />)}
          </>
        )}
        <p className="px-3.5 pb-1 pt-5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-teal-200/40">Cuenta</p>
        <NavLink item={{ href: '/profile', label: 'Mi Perfil', icon: UserCircle }} />
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400/20 text-sm font-bold text-gold-400">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="truncate text-xs text-teal-200/60">{roleLabel}</p>
          </div>
        </div>
        <button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-teal-100/70 transition hover:bg-white/5 hover:text-white">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Topbar móvil */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#ece5d6] bg-sand-50/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <HotelLogo size={28} className="text-teal-600" />
          <span className="display text-lg font-semibold">HotelApp</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink-soft hover:bg-sand-100"><Menu size={22} /></button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hotel-pattern fixed inset-y-0 left-0 z-30 hidden w-64 bg-[#0c3f3c] lg:block">{content}</aside>

      {/* Drawer móvil */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="hotel-pattern absolute inset-y-0 left-0 w-72 bg-[#0c3f3c]">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 text-teal-100/70"><X size={22} /></button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
