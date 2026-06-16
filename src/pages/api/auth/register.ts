import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { hashPassword, createSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: 'Todos los campos (nombre, correo, contraseña) son obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prisma = getDb();

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'El correo electrónico ya está registrado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Encriptar contraseña y crear usuario
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    // Crear sesión y obtener token
    const token = await createSession(user.id);

    // Guardar en cookie HTTP-only
    const cookieString = `session_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;

    return new Response(JSON.stringify({ success: true, message: 'Usuario registrado con éxito' }), {
      status: 201,
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
