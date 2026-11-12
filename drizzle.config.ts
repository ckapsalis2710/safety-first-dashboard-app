import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL;

export default defineConfig({
  dialect: 'postgresql',
  // Step 2 will define the application schema at this path.
  schema: './server/db/schema.ts',
  out: './drizzle',
  ...(url ? { dbCredentials: { url } } : {}),
});
