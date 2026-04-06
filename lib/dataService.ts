import type { SiteData } from '@/types';
import siteJson from '@/data/site.json';

export function getSiteData(): SiteData {
  return siteJson as SiteData;
}

export async function getSiteDataSafe(): Promise<SiteData> {
  const data = getSiteData();

  if (!data.meta || !data.home) {
    throw new Error('Estructura de datos inválida en site.json');
  }

  return data;
}
