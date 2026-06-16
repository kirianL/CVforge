import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

// Actualizar un Currículum Específico (Autoguardado debounced)
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Falta el ID del currículum' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { title, content, isPublished, templateId } = await request.json();

    if (title === undefined && content === undefined && isPublished === undefined && templateId === undefined) {
      return new Response(JSON.stringify({ error: 'Debe proporcionar al menos un campo para actualizar (title, content, isPublished, templateId)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prisma = getDb();

    // Validar propiedad del CV antes de guardar
    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.id },
    });

    if (!resume) {
      return new Response(JSON.stringify({ error: 'Currículum no encontrado o no pertenece a tu cuenta' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Actualizar registro con campos suministrados
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (templateId !== undefined) updateData.templateId = templateId;

    await prisma.resume.update({
      where: { id },
      data: updateData,
    });

    return new Response(JSON.stringify({ success: true, message: 'Currículum guardado con éxito' }), {
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
