import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const audienceId = import.meta.env.RESEND_AUDIENCE_ID;

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

    // Verificar si el contacto existe
    const { data: contactsList } = await resend.contacts.list({ audienceId });

    const existing = contactsList?.data?.find(
      (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (!existing) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'El correo no está suscrito.',
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Eliminar el contacto
    const { error: removeError } = await resend.contacts.remove({
      audienceId,
      id: existing.id,
    });

    if (removeError) {
      console.error('Error al eliminar contacto:', removeError);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Error al procesar tu solicitud de desuscripción.',
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

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
