import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// ── Singleton seguro para HMR en Next.js dev ──────────────────────────────
// En producción siempre se crea una instancia nueva (módulos no se recargan).
// En desarrollo, Next.js recarga módulos en caliente y crea múltiples pools
// si no se guarda la referencia en globalThis, lo que genera ECONNRESET.

declare global {
  // eslint-disable-next-line no-var
  var _pgClient: postgres.Sql | undefined;
  // eslint-disable-next-line no-var
  var _drizzleDb: PostgresJsDatabase<typeof schema> | undefined;
}

function createClient(): postgres.Sql {
  return postgres(process.env.DATABASE_URL!, {
    prepare:        false,  // requerido para Supabase pgBouncer (transaction mode)
    max:            10,
    idle_timeout:   5,      // liberar antes de que pgBouncer cierre la conexión (~600s)
    max_lifetime:   60 * 30, // 30 min — por debajo del server_lifetime de pgBouncer
    connect_timeout: 30,
    onnotice:       () => {},  // silenciar notices de Postgres
  });
}

const isDev = process.env.NODE_ENV !== 'production';

// Suprimir ECONNRESET en dev: ocurre cuando Next.js aborta una request
// en vuelo (HMR, navegación rápida) y pgBouncer cierra la conexión TCP.
if (isDev && typeof process !== 'undefined') {
  process.on('uncaughtException', (err: NodeJS.ErrnoException) => {
    if (err.code === 'ECONNRESET' || (err as Error & { code?: string }).message === 'aborted') return;
    throw err;
  });
}

const sql: postgres.Sql = isDev
  ? (globalThis._pgClient ??= createClient())
  : createClient();

export const db: PostgresJsDatabase<typeof schema> = isDev
  ? (globalThis._drizzleDb ??= drizzle(sql, { schema }))
  : drizzle(sql, { schema });

export type DB = typeof db;
