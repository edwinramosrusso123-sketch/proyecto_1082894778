import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { SessionProvider } from '@/components/SessionProvider';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen">
        <Sidebar role={session.role} name={session.name} email={session.email} />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-10">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
