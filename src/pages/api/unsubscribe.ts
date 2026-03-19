import type { APIRoute } from 'astro';
import sgClient from '@sendgrid/client';

const sendgridApiKey = import.meta.env.SENDGRID_API_KEY;
sgClient.setApiKey(sendgridApiKey);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'El correo electrónico es requerido.',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Email no válido',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Verificar si el contacto existe (sanitized query)
    const sanitizedEmail = email.replace(/'/g, "\\'");
    const requestSearch = {
      url: '/v3/marketing/contacts/search' as const,
      method: 'POST' as const,
      body: { query: `email LIKE '${sanitizedEmail}'` },
    };
    const [searchData] = await sgClient.request(requestSearch);
    const searchBody = searchData.body as { result?: Array<{ id: string }> };

    if (!searchBody.result || searchBody.result.length === 0) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'El correo no está suscrito.',
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Eliminar el contacto
    const deleteRequest = {
      url: '/v3/marketing/contacts' as const,
      method: 'DELETE' as const,
      qs: { ids: searchBody.result[0].id },
    };
    await sgClient.request(deleteRequest);

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Te has desuscrito correctamente.',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al desuscribirse:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Error al procesar tu solicitud de desuscripción.',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
