"use client";
import React from 'react';
import { parseJwt } from '@/lib/auth';

export default function Sidebar() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const payload = token ? parseJwt(token) : null;
  const role = payload?.role;

  if (!role) return null;

  const items = {
    superadmin: ['Dashboard', 'Rooms', 'Clients', 'Settings'],
    recepcion: ['Dashboard', 'Check-in', 'Rooms'],
    cliente: ['Mis Reservas', 'Perfil'],
  } as any;

  return (
    <aside style={{ width: 220, background: '#f3f4f6', padding: '1rem' }}>
      <h4>Menu</h4>
      <ul>
        {items[role].map((it: string) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </aside>
  );
}
