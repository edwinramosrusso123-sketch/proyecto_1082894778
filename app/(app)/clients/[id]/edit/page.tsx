import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getClientById } from '@/lib/dataService';
import { PageHeader } from '@/components/ui/primitives';
import { ClientForm } from '@/components/clients/ClientForm';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();
  return (
    <div>
      <Link href={`/clients/${client.id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-teal-600"><ArrowLeft size={16} /> Volver</Link>
      <PageHeader subtitle={client.name} title="Editar cliente" />
      <ClientForm client={client} />
    </div>
  );
}
