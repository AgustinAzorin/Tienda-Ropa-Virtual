import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection pool singleton — reused across requests in the same module scope
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch for serverless environments (Vercel / Next.js edge)
const sql = postgres(connectionString, { prepare: false });

export const db = drizzle(sql, { schema });

export type DB = typeof db;
