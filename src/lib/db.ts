import './env';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

let prisma: PrismaClient;

// Obtener cliente de Prisma con soporte para import.meta.env (Astro/Vite) y process.env (Vercel/Node)
export function getDb(): PrismaClient {
  const metaEnv = (import.meta as any).env;
  const databaseUrl = (metaEnv ? metaEnv.DATABASE_URL : undefined) || (typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined);
  
  if (!prisma) {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL no está configurada en las variables de entorno (import.meta.env ni process.env).");
    }
    
    if (typeof process !== 'undefined') {
      process.env.DATABASE_URL = databaseUrl;
    }

    const adapter = new PrismaNeon({
      connectionString: databaseUrl,
      webSocketConstructor: typeof globalThis.WebSocket === 'undefined' || (typeof process !== 'undefined' && process.versions && process.versions.node) ? ws : undefined
    });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}
