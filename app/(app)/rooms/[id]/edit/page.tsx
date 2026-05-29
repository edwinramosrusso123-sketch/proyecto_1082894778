import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { getRoomById } from '@/lib/dataService';
import { PageHeader } from '@/components/ui/primitives';
import { RoomForm } from '@/components/rooms/RoomForm';

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== 'superadmin') redirect('/rooms');
  const { id } = await params;
  const room = await getRoomById(id);
  if (!room) notFound();
  return (
    <div>
      <Link href={`/rooms/${room.id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-teal-600"><ArrowLeft size={16} /> Volver</Link>
      <PageHeader subtitle={`Habitación ${room.room_number}`} title="Editar habitación" />
      <RoomForm room={room} />
    </div>
  );
}
