import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Buscar token en las cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookies(cookieHeader);
    const token = cookies['session_token'];

    if (token) {
      const prisma = getDb();
      // Eliminar sesión de base de datos
      await prisma.session.delete({
        where: { id: token },
      }).catch(() => {});
    }

    // Expirar la cookie inmediatamente
    const cookieString = `session_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    return new Response(JSON.stringify({ success: true, message: 'Sesión cerrada con éxito' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieString,
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error interno en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

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
