import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/primitives';
import { ClientForm } from '@/components/clients/ClientForm';

export default function NewClientPage() {
  return (
    <div>
      <Link href="/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-teal-600"><ArrowLeft size={16} /> Clientes</Link>
      <PageHeader subtitle="Huéspedes" title="Registrar cliente" />
      <ClientForm />
    </div>
  );
}
