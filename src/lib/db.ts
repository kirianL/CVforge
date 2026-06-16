import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Configurar WebSocket para Node.js si no existe nativo (desarrollo local)
if (typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

let prisma: PrismaClient;

// Obtener cliente de Prisma con soporte para import.meta.env (Astro/Vite) y process.env (Vercel/Node)
export function getDb(): PrismaClient {
  const databaseUrl = import.meta.env.DATABASE_URL || (typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined);
  console.log("DATABASE_URL RESOLUTION DIAGNOSTIC:");
  console.log("- import.meta.env.DATABASE_URL:", import.meta.env.DATABASE_URL ? "Exists (length: " + import.meta.env.DATABASE_URL.length + ")" : "Undefined");
  console.log("- process.env.DATABASE_URL:", (typeof process !== 'undefined' && process.env.DATABASE_URL) ? "Exists (length: " + process.env.DATABASE_URL.length + ")" : "Undefined");
  console.log("- Resolved Url:", databaseUrl ? "Exists" : "Undefined");
  
  if (!prisma) {
    if (!databaseUrl) {
      throw new Error("DATABASE_URL no está configurada en las variables de entorno (import.meta.env ni process.env).");
    }
    
    if (typeof process !== 'undefined') {
      process.env.DATABASE_URL = databaseUrl;
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaNeon(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}
