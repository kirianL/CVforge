import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

// Crear un nuevo Currículum
export const POST: APIRoute = async ({ request }) => {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { title } = await request.json();
    if (!title) {
      return new Response(JSON.stringify({ error: 'El título es obligatorio' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prisma = getDb();

    // Estructura por defecto para el CV (Zod-ready)
    const defaultContent = {
      personal: {
        name: user.name || '',
        title: '',
        email: user.email,
        phone: '',
        website: '',
        location: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'languages', 'certifications'],
    };

    const id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36).substring(2, 6);
    const slug = `cv-${id}`;

    const resume = await prisma.resume.create({
      data: {
        id,
        userId: user.id,
        title,
        slug,
        content: defaultContent,
      },
    });

    return new Response(JSON.stringify({ success: true, id: resume.id }), {
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

// Eliminar un currículum
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Falta el ID del currículum' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prisma = getDb();

    // Verificar propiedad antes de borrar
    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.id },
    });

    if (!resume) {
      return new Response(JSON.stringify({ error: 'Currículum no encontrado o no pertenece a tu cuenta' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await prisma.resume.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true, message: 'Currículum eliminado con éxito' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error interno en el servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
