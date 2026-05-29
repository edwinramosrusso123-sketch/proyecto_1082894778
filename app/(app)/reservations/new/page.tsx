import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/primitives';
import { ReservationForm } from '@/components/reservations/ReservationForm';

export default function NewReservationPage() {
  return (
    <div>
      <Link href="/reservations" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-teal-600"><ArrowLeft size={16} /> Reservas</Link>
      <PageHeader subtitle="Operación" title="Nueva reserva" />
      <ReservationForm />
    </div>
  );
}
