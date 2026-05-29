'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/clientApi';

export function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function del() {
    setLoading(true);
    try {
      await api(`/api/clients/${id}`, { method: 'DELETE' });
      toast('Cliente eliminado', 'success');
      router.push('/clients');
      router.refresh();
    } catch (e) { toast((e as Error).message, 'error'); setLoading(false); setOpen(false); }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-danger"><Trash2 size={16} /> Eliminar</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Eliminar cliente">
        <p className="text-sm text-ink-soft">¿Eliminar a <b>{name}</b>? No se permite si tiene reservas activas.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setOpen(false)} className="btn-ghost">Cancelar</button>
          <button onClick={del} disabled={loading} className="btn-danger">{loading ? <Spinner /> : 'Sí, eliminar'}</button>
        </div>
      </Modal>
    </>
  );
}
