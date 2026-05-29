import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getDashboardData } from '@/lib/dataService';

export const GET = withAuth(async () => {
  const data = await getDashboardData();
  return NextResponse.json({ data });
}, ['recepcion', 'superadmin']);
