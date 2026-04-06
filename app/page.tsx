import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hola Mundo',
};

export default function Home() {
  return (
    <main className="page-root">
      <div className="hero">
        <h1>Hola Mundo</h1>
        <p>TypeScript y Next.js 14 listos para desplegar en Vercel.</p>
      </div>
    </main>
  );
}
