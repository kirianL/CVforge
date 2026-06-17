import type { APIRoute } from 'astro';
import { getDb } from '../../../../../lib/db';
import { createSession } from '../../../../../lib/auth';

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    // Parsear cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const parts = c.trim().split('=');
        return [parts[0], parts.slice(1).join('=')];
      })
    );
    const savedState = cookies['oauth_state'];

    // Validar CSRF state
    if (!state || !savedState || state !== savedState) {
      return new Response(JSON.stringify({ error: 'Estado de autenticación inválido (CSRF detectado)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!code) {
      return new Response(JSON.stringify({ error: 'Falta el código de autorización' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const metaEnv = (import.meta as any).env;
    const clientId = metaEnv.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
    const clientSecret = metaEnv.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = metaEnv.GITHUB_CALLBACK_URL || process.env.GITHUB_CALLBACK_URL;

    if (!clientId || !clientSecret || !redirectUri) {
      return new Response(JSON.stringify({ error: 'Configuración de GitHub OAuth incompleta en el servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Intercambiar el código por un token de acceso
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        state,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      return new Response(JSON.stringify({ error: tokenData.error_description || tokenData.error || 'Error al obtener token de GitHub' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const accessToken = tokenData.access_token;

    // Obtener perfil de usuario de GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'CVForge-Astro',
      },
    });

    const profile = await userResponse.json();

    if (!userResponse.ok) {
      return new Response(JSON.stringify({ error: 'Error al obtener perfil del usuario desde GitHub' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const githubId = String(profile.id);
    let email = profile.email;
    const name = profile.name || profile.login || 'GitHub User';

    // GitHub no siempre devuelve el email en el perfil principal (ej: si es privado)
    // Hacemos una llamada adicional para consultar la lista completa de emails
    if (!email) {
      try {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'CVForge-Astro',
          },
        });

        if (emailsResponse.ok) {
          const emailsList: GitHubEmail[] = await emailsResponse.json();
          // Buscar email primario y verificado
          const primaryEmail = emailsList.find(e => e.primary && e.verified) || emailsList.find(e => e.primary) || emailsList[0];
          if (primaryEmail) {
            email = primaryEmail.email;
          }
        }
      } catch (err) {
        console.error('Error al obtener emails de GitHub:', err);
      }
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'GitHub no devolvió una dirección de correo válida para tu cuenta' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prisma = getDb();

    // 1. Buscar si la cuenta OAuth ya existe
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'github',
          providerAccountId: githubId,
        },
      },
      include: { user: true },
    });

    let user = account?.user;

    if (!user) {
      // 2. Si la cuenta OAuth no existe, verificar si existe un usuario con el mismo email
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Enlazar cuenta de GitHub al usuario existente
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'github',
            providerAccountId: githubId,
            accessToken: accessToken,
          },
        });
      } else {
        // 3. Crear nuevo usuario y enlazar cuenta de GitHub
        user = await prisma.user.create({
          data: {
            email,
            name,
            role: 'USER',
            accounts: {
              create: {
                type: 'oauth',
                provider: 'github',
                providerAccountId: githubId,
                accessToken: accessToken,
              },
            },
          },
        });
      }
    } else {
      // Actualizar tokens en la cuenta existente
      await prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          accessToken: accessToken,
        },
      });
    }

    // Crear sesión de la aplicación
    const sessionToken = await createSession(user.id);

    // Guardar en cookie HTTP-only y expirar la cookie de state de OAuth
    const sessionCookie = `session_token=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;
    const clearStateCookie = `oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

    const headers = new Headers();
    headers.set('Location', '/dashboard');
    headers.append('Set-Cookie', sessionCookie);
    headers.append('Set-Cookie', clearStateCookie);

    return new Response(null, {
      status: 302,
      headers
    });

  } catch (error: any) {
    console.error('Error en GitHub OAuth Callback:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
