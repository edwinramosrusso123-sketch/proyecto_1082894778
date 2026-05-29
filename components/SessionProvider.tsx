'use client';
import { createContext, useContext } from 'react';
import type { Session } from '@/lib/types';

const SessionCtx = createContext<Session | null>(null);
export const useSession = () => useContext(SessionCtx);

export function SessionProvider({ session, children }: { session: Session; children: React.ReactNode }) {
  return <SessionCtx.Provider value={session}>{children}</SessionCtx.Provider>;
}
