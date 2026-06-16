import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { html } = await request.json();
    
    if (!html) {
      return new Response(JSON.stringify({ error: 'Falta el contenido HTML del currículum' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Leemos la API key de Browserless desde las variables de entorno
    // En Cloudflare Pages/Workers, se lee desde process.env o se inyecta en la plataforma
    const browserlessToken = typeof process !== 'undefined' ? process.env.BROWSERLESS_API_KEY : undefined;

    let pdfBuffer: ArrayBuffer;

    if (browserlessToken) {
      // 1. Opción de producción / Cloud: Browserless.io (Plan gratuito de 1000 créditos)
      const response = await fetch(`https://chrome.browserless.io/pdf?token=${browserlessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: html,
          options: {
            displayHeaderFooter: false,
            printBackground: true,
            format: 'A4',
            margin: {
              top: '2cm',
              bottom: '2cm',
              left: '2cm',
              right: '2cm'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Servicio Browserless falló: ${response.statusText}`);
      }
      
      pdfBuffer = await response.arrayBuffer();
    } else {
      // 2. Opción de desarrollo local: Intenta conectar a Gotenberg local (http://localhost:3000)
      const formData = new FormData();
      const htmlBlob = new Blob([html], { type: 'text/html' });
      formData.append('files', htmlBlob, 'index.html');
      
      // Configuraciones de margen para Gotenberg
      formData.append('marginTop', '2');
      formData.append('marginBottom', '2');
      formData.append('marginLeft', '2');
      formData.append('marginRight', '2');
      formData.append('paperWidth', '8.27'); // A4 Width in inches
      formData.append('paperHeight', '11.7'); // A4 Height in inches

      try {
        const response = await fetch('http://localhost:3000/api/common/convert/html', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Gotenberg local retornó un error');
        }
        
        pdfBuffer = await response.arrayBuffer();
      } catch (err) {
        // Si no está corriendo Gotenberg ni configurado Browserless, arrojamos error descriptivo
        return new Response(
          JSON.stringify({ 
            error: 'Generador de PDF no disponible. Para descargar directamente:\n' +
                   '1. Configura BROWSERLESS_API_KEY en tu .env para usar la nube gratuita, o\n' +
                   '2. Ejecuta Gotenberg localmente usando Docker: "docker run -d -p 3000:3000 gotenberg/gotenberg:8"'
          }), 
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="curriculum.pdf"',
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error interno al generar el PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
