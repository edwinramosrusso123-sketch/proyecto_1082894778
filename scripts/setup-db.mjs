// Aplica las migraciones SQL contra Supabase Postgres (conexión directa, no pooler).
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { makeClient } from './_db.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

const client = makeClient();

async function main() {
  await client.connect();
  console.log('Conectado a Supabase Postgres.');

  // Asegura tabla de control
  await client.query(`CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  );`);

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const { rows } = await client.query('SELECT 1 FROM _migrations WHERE filename = $1', [file]);
    if (rows.length) {
      console.log(`= ${file} (ya aplicada)`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`+ ${file} aplicada`);
    } catch (e) {
      await client.query('ROLLBACK');
      throw new Error(`Error aplicando ${file}: ${e.message}`);
    }
  }

  const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
  console.log('Tablas:', tables.rows.map((r) => r.table_name).join(', '));
  await client.end();
  console.log('Migraciones completas.');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
