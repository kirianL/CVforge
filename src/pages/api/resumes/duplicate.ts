import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id: originalId } = await request.json();
    if (!originalId) {
      return new Response(JSON.stringify({ error: 'El ID del currículum original es obligatorio' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prisma = getDb();

    // Buscar el currículum original y validar propiedad
    const originalResume = await prisma.resume.findFirst({
      where: { id: originalId, userId: user.id },
    });

    if (!originalResume) {
      return new Response(JSON.stringify({ error: 'Currículum original no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar nuevos IDs
    const id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36).substring(2, 6);
    const slug = `cv-${id}`;

    // Crear la copia
    const duplicate = await prisma.resume.create({
      data: {
        id,
        userId: user.id,
        title: `${originalResume.title} (Copia)`,
        slug,
        content: originalResume.content || {},
        templateId: originalResume.templateId,
        language: originalResume.language,
        isPublished: false, // Las copias se crean despublicadas por defecto
      },
    });

    return new Response(JSON.stringify({ success: true, id: duplicate.id, title: duplicate.title }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error interno en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
