import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { PageHeader } from '@/components/ui/primitives';
import { RoomForm } from '@/components/rooms/RoomForm';

export default async function NewRoomPage() {
  const session = await getSession();
  if (session?.role !== 'superadmin') redirect('/rooms');
  return (
    <div>
      <Link href="/rooms" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-teal-600"><ArrowLeft size={16} /> Habitaciones</Link>
      <PageHeader subtitle="Inventario" title="Nueva habitación" />
      <RoomForm />
    </div>
  );
}
