// Helper de conexión pg para scripts. Strippea sslmode del string y fuerza
// ssl sin verificación de cadena (Supabase usa certificados self-signed).
import pg from 'pg';

export function makeClient() {
  const raw = process.env.POSTGRES_URL_NON_POOLING;
  if (!raw) {
    console.error('Falta POSTGRES_URL_NON_POOLING en el entorno');
    process.exit(1);
  }
  const url = new URL(raw);
  url.search = ''; // quitar sslmode y demás flags
  return new pg.Client({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
  });
}
