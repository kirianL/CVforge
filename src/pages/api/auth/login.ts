import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { verifyPassword, createSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'El correo y la contraseña son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prisma = getDb();

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar contraseña
    const passwordMatch = await verifyPassword(password, user.passwordHash);

    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear sesión y obtener token
    const token = await createSession(user.id);

    // Guardar en cookie HTTP-only
    const cookieString = `session_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;

    return new Response(JSON.stringify({ success: true, message: 'Sesión iniciada con éxito' }), {
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
