import './globals.css';
import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';

export const metadata: Metadata = {
  title: 'Mi App Fullstack',
  description: 'Proyecto TypeScript con Next.js y Vercel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1 }}>{children}</main>
      </body>
    </html>
  );
}
