import type { NextRequest } from 'next/server';
import type { SiteData } from '@/types';
import siteJson from '@/data/site.json';

export async function GET(request: NextRequest) {
  const data = siteJson as SiteData;
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
