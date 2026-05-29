'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, UserCheck } from 'lucide-react';
import { api } from '@/lib/clientApi';
import type { Client } from '@/lib/types';

// Buscador con debounce 300ms. onSelect recibe el cliente elegido.
export function ClientSearchInput({ onSelect, selected }: { onSelect: (c: Client | null) => void; selected?: Client | null }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) return;
    const t = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const { clients } = await api<{ clients: Client[] }>(`/api/clients/search?q=${encodeURIComponent(query)}`);
        setResults(clients); setOpen(true);
      } catch { /* ignore */ } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, selected]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">{selected.name.charAt(0)}</div>
          <div>
            <p className="text-sm font-semibold text-ink">{selected.name}</p>
            <p className="text-xs text-ink-faint">{selected.identification_number} · {selected.email}</p>
          </div>
        </div>
        <button type="button" onClick={() => { onSelect(null); setQuery(''); }} className="text-sm font-semibold text-teal-700 hover:underline">Cambiar</button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
      <input className="input-field pl-10" placeholder="Buscar por nombre o documento..." value={query}
        onChange={(e) => setQuery(e.target.value)} onFocus={() => results.length && setOpen(true)} />
      {open && (
        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-[#ece5d6] bg-white p-1.5 shadow-lift">
          {loading && <p className="px-3 py-2 text-sm text-ink-faint">Buscando...</p>}
          {!loading && results.length === 0 && <p className="px-3 py-2 text-sm text-ink-faint">Sin resultados.</p>}
          {results.map((c) => (
            <button key={c.id} type="button" onClick={() => { onSelect(c); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-sand-50">
              <UserCheck size={16} className="text-teal-600" />
              <div>
                <p className="text-sm font-semibold text-ink">{c.name}</p>
                <p className="text-xs text-ink-faint">{c.identification_number} · {c.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
