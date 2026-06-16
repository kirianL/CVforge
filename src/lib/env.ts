import 'dotenv/config';

// Ensure DATABASE_URL is set in process.env for Prisma and DB drivers to see at import/init time
const metaEnv = (import.meta as any).env;
const databaseUrl = (metaEnv ? metaEnv.DATABASE_URL : undefined) || (typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined);
if (databaseUrl && typeof process !== 'undefined') {
  process.env.DATABASE_URL = databaseUrl;
}

