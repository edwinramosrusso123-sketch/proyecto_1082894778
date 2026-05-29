// Auditoría append-only en Supabase (tabla audit_log).
// El plan original usaba Vercel Blob; aquí toda la data — incluida la
// auditoría — vive en Supabase. Solo lo importa dataService.
import { getSupabase } from './supabase';
import type { AuditEntry } from './types';

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from('audit_log').insert({
      user_id: entry.user_id,
      user_email: entry.user_email,
      user_role: entry.user_role,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id ?? null,
      summary: entry.summary,
      metadata: entry.metadata ?? null,
    });
  } catch (e) {
    // La auditoría nunca debe romper la operación principal.
    console.error('audit error:', (e as Error).message);
  }
}

export async function readAudit(limit = 200): Promise<AuditEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as AuditEntry[];
}
