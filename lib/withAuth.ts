// Helpers para envolver handlers de API con autenticación/autorización
// y normalizar el manejo de errores de dominio.
import { NextResponse } from 'next/server';
import { getSession } from './auth';
import { AppError, ForbiddenError, UnauthorizedError, ValidationError } from './errors';
import type { Role, Session } from './types';

export function jsonError(err: unknown): NextResponse {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message, code: err.code, details: err.details }, { status: err.status });
  }
  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
  }
  console.error('Unhandled API error:', err);
  return NextResponse.json({ error: 'Error interno del servidor', code: 'INTERNAL' }, { status: 500 });
}

type Handler = (ctx: { session: Session; req: Request; params: Record<string, string> }) => Promise<NextResponse> | NextResponse;
type RouteCtx = { params: Promise<Record<string, string>> };

export function withAuth(handler: Handler, allowedRoles?: Role[]) {
  return async (req: Request, context: RouteCtx) => {
    try {
      const session = await getSession();
      if (!session) throw new UnauthorizedError();
      if (allowedRoles && !allowedRoles.includes(session.role)) {
        throw new ForbiddenError();
      }
      const params = context?.params ? await context.params : {};
      return await handler({ session, req, params });
    } catch (err) {
      return jsonError(err);
    }
  };
}
