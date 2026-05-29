import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';

export const GET = withAuth(async ({ session }) => {
  return NextResponse.json({ user: session });
});
