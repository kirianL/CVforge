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
    const clientId = metaEnv.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = metaEnv.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

    // Calcular la URI de redireccionamiento dinámicamente según el origen de la petición
    const urlObj = new URL(request.url);
    const isLocalhost = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
    const protocol = isLocalhost ? urlObj.protocol : 'https:';
    const redirectUri = `${protocol}//${urlObj.host}/api/auth/oauth/google/callback`;

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: 'Configuración de Google OAuth incompleta en el servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Intercambiar el código por un token de acceso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return new Response(JSON.stringify({ error: tokenData.error_description || 'Error al obtener token de Google' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Obtener perfil de usuario
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile = await userinfoResponse.json();

    if (!userinfoResponse.ok) {
      return new Response(JSON.stringify({ error: 'Error al obtener perfil del usuario desde Google' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const googleId = profile.sub;
    const email = profile.email;
    const name = profile.name || email.split('@')[0];

    if (!email) {
      return new Response(JSON.stringify({ error: 'Google no devolvió una dirección de correo válida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prisma = getDb();

    // 1. Buscar si la cuenta OAuth ya existe
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleId,
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
        // Enlazar cuenta de Google al usuario existente
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleId,
            accessToken: access_token,
            refreshToken: refresh_token || null,
            expiresAt: expires_in ? Math.floor(Date.now() / 1000) + expires_in : null,
          },
        });
      } else {
        // 3. Crear nuevo usuario y enlazar cuenta de Google
        user = await prisma.user.create({
          data: {
            email,
            name,
            role: 'USER',
            accounts: {
              create: {
                type: 'oauth',
                provider: 'google',
                providerAccountId: googleId,
                accessToken: access_token,
                refreshToken: refresh_token || null,
                expiresAt: expires_in ? Math.floor(Date.now() / 1000) + expires_in : null,
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
          accessToken: access_token,
          refreshToken: refresh_token || account.refreshToken,
          expiresAt: expires_in ? Math.floor(Date.now() / 1000) + expires_in : account.expiresAt,
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
    console.error('Error en Google OAuth Callback:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
