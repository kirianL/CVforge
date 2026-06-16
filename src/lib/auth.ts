import bcrypt from 'bcryptjs';
import { getDb } from './db';
import type { User } from '@prisma/client';

// Obtener instancia de Prisma de forma segura para Serverless
const getPrisma = () => {
  return getDb();
};

// Encriptación de contraseñas
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Crear sesión en base de datos
export async function createSession(userId: string): Promise<string> {
  const prisma = getPrisma();
  
  // Generar token aleatorio seguro
  const token = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
    
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 días de duración

  await prisma.session.create({
    data: {
      id: token,
      userId,
      expiresAt,
    },
  });

  return token;
}

// Validar token de sesión y retornar el usuario
export async function validateSession(token: string): Promise<User | null> {
  if (!token) return null;
  const prisma = getPrisma();

  try {
    const session = await prisma.session.findUnique({
      where: { id: token },
      include: { user: true },
    });

    if (!session) return null;

    // Verificar si la sesión ha expirado
    if (new Date() > session.expiresAt) {
      // Eliminar sesión expirada de forma asíncrona
      await prisma.session.delete({ where: { id: token } }).catch(() => {});
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Error al validar sesión:", error);
    return null;
  }
}

// Obtener sesión activa de las Cookies de la petición HTTP
export async function getUserFromRequest(request: Request): Promise<User | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const token = cookies['session_token'];
  
  if (!token) return null;
  return validateSession(token);
}

// Utilidad para parsear cookies
function parseCookies(cookieHeader: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    const value = decodeURIComponent(parts.join('='));
    if (name) {
      list[name] = value;
    }
  });

  return list;
}
