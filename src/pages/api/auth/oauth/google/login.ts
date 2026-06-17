import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    const metaEnv = (import.meta as any).env;
    const clientId = metaEnv.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

    // Calcular la URI de redireccionamiento dinámicamente según el origen de la petición
    const urlObj = new URL(request.url);
    const isLocalhost = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
    const protocol = isLocalhost ? urlObj.protocol : 'https:';
    const redirectUri = `${protocol}//${urlObj.host}/api/auth/oauth/google/callback`;

    if (!clientId) {
      return new Response(JSON.stringify({ error: 'Configuración de Google OAuth incompleta (falta GOOGLE_CLIENT_ID)' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar state CSRF
    const state = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Guardar state en cookie de corta duración (10 min)
    const stateCookie = `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&state=${state}` +
      `&access_type=offline` +
      `&prompt=consent`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': authUrl,
        'Set-Cookie': stateCookie
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
