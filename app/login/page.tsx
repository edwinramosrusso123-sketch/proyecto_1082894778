"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseJwt } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@hotelapp.test');
  const [password, setPassword] = useState('supersecret');
  const [error, setError] = useState('');

  async function onSubmit(e: any) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Error');
        return;
      }
      const token = data.token;
      // token set as cookie by server; still parse for client-side redirect
      const payload = parseJwt(token);
      const role = payload?.role;
      if (role === 'superadmin' || role === 'recepcion') router.push('/dashboard' as any);
      else if (role === 'cliente') router.push('/my-reservations' as any);
      else router.push('/' as any);
    } catch (err) {
      setError('Error de conexión');
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, background: '#0f766e', color: 'white', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>HotelApp</h1>
        <p style={{ opacity: 0.9 }}>Bienvenido — gestiona tu hotel con confianza</p>
      </div>
      <div style={{ flex: 1, background: 'white', padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 420 }}>
          <h2>Iniciar sesión</h2>
          <label style={{ display: 'block', marginTop: 12 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 8 }} />
          <label style={{ display: 'block', marginTop: 12 }}>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8 }} />
          {error && <p style={{ color: 'crimson' }}>{error}</p>}
          <button style={{ marginTop: 16, padding: '0.5rem 1rem', background: '#0f766e', color: 'white', border: 'none' }}>Ingresar</button>
        </form>
      </div>
    </div>
  );
}
