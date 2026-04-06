import './globals.css';
import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
