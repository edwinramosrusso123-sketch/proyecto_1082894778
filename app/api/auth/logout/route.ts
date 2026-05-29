import { NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';
import { recordAudit } from '@/lib/dataService';

export async function POST() {
  const session = await getSession();
  if (session) {
    await recordAudit({
      user_id: session.userId, user_email: session.email, user_role: session.role,
      action: 'logout', entity: 'system', summary: `${session.email} cerró sesión`,
    });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
