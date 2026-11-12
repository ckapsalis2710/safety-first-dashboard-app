import { sql } from 'drizzle-orm';
import { createDatabase } from './connection.ts';

try {
  const { db, pool } = createDatabase();
  try {
    await db.execute(sql`SELECT 1`);
  } finally {
    await pool.end();
  }
  console.log('PostgreSQL connection check passed (SELECT 1).');
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error.';
  console.error(`PostgreSQL connection check failed: ${message}`);
  process.exitCode = 1;
}
