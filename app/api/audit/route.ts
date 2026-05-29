import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getAudit } from '@/lib/dataService';

export const GET = withAuth(async ({ req }) => {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') ?? '200');
  const entries = await getAudit(Number.isFinite(limit) ? limit : 200);
  return NextResponse.json({ entries });
}, ['superadmin']);
