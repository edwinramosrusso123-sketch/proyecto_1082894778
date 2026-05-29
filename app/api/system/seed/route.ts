import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { seedDatabase } from '@/lib/seedData';

// Bootstrap/seed desde /admin/db-setup (solo superadmin)
export const POST = withAuth(async () => {
  const counts = await seedDatabase();
  return NextResponse.json({ ok: true, counts });
}, ['superadmin']);
