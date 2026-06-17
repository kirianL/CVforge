import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    const metaEnv = (import.meta as any).env;
    const clientId = metaEnv.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
    const redirectUri = metaEnv.GITHUB_CALLBACK_URL || process.env.GITHUB_CALLBACK_URL;

    if (!clientId || !redirectUri) {
      return new Response(JSON.stringify({ error: 'Configuración de GitHub OAuth incompleta en el servidor' }), {
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

    const authUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent('read:user user:email')}` +
      `&state=${state}`;

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
