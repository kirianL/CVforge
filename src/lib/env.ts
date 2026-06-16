import 'dotenv/config';

// Ensure DATABASE_URL is set in process.env for Prisma and DB drivers to see at import/init time
const databaseUrl = import.meta.env.DATABASE_URL || (typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined);
if (databaseUrl && typeof process !== 'undefined') {
  process.env.DATABASE_URL = databaseUrl;
}
