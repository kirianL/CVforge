import type { APIRoute } from 'astro';
import { getDb } from '../../../../../lib/db';
import { createSession } from '../../../../../lib/auth';

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
    const clientId = metaEnv.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = metaEnv.LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_CLIENT_SECRET;

    // Calcular la URI de redireccionamiento dinámicamente según el origen de la petición
    const urlObj = new URL(request.url);
    const isLocalhost = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
    const protocol = isLocalhost ? urlObj.protocol : 'https:';
    const redirectUri = `${protocol}//${urlObj.host}/api/auth/oauth/linkedin/callback`;

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: 'Configuración de LinkedIn OAuth incompleta en el servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Intercambiar el código por un token de acceso
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      return new Response(JSON.stringify({ error: tokenData.error_description || tokenData.error || 'Error al obtener token de LinkedIn' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in;

    // Obtener perfil de usuario desde el endpoint de UserInfo de LinkedIn (OIDC)
    const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await userinfoResponse.json();

    if (!userinfoResponse.ok) {
      return new Response(JSON.stringify({ error: 'Error al obtener perfil del usuario desde LinkedIn' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const linkedinId = profile.sub; // OIDC 'sub' is the unique member ID
    const email = profile.email;
    const name = profile.name || `${profile.given_name} ${profile.family_name}` || 'LinkedIn User';

    if (!email) {
      return new Response(JSON.stringify({ error: 'LinkedIn no devolvió una dirección de correo válida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prisma = getDb();

    // 1. Buscar si la cuenta OAuth ya existe
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'linkedin',
          providerAccountId: linkedinId,
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
        // Enlazar cuenta de LinkedIn al usuario existente
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'linkedin',
            providerAccountId: linkedinId,
            accessToken: accessToken,
            expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null,
          },
        });
      } else {
        // 3. Crear nuevo usuario y enlazar cuenta de LinkedIn
        user = await prisma.user.create({
          data: {
            email,
            name,
            role: 'USER',
            accounts: {
              create: {
                type: 'oauth',
                provider: 'linkedin',
                providerAccountId: linkedinId,
                accessToken: accessToken,
                expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : null,
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
          expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : account.expiresAt,
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
    console.error('Error en LinkedIn OAuth Callback:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
