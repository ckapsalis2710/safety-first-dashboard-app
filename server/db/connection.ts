import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const createDatabase = (connectionString = process.env.DATABASE_URL) => {
  const url = connectionString?.trim();
  if (!url) {
    throw new Error('DATABASE_URL is required. See .env.example for local setup.');
  }

  // The caller owns the pool lifetime. Connections open when a query is made.
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 5_000 });
  return { db: drizzle(pool), pool };
};
