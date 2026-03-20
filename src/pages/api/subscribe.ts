import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const audienceId = import.meta.env.RESEND_AUDIENCE_ID;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'El correo y el nombre son requeridos',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Email no válido',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Verificar si el contacto ya existe
    const { data: contactsList } = await resend.contacts.list({ audienceId });

    const existing = contactsList?.data?.find(
      (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Este correo ya está suscrito a la newsletter',
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    // Agregar el contacto a la audiencia
    const { error: createError } = await resend.contacts.create({
      audienceId,
      email,
      firstName: String(name).slice(0, 100),
    });

    if (createError) {
      console.error('Error al agregar el contacto:', createError);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Error al suscribirse a la newsletter',
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Enviar correo de bienvenida (no bloquea la suscripción si falla)
    try {
      await resend.emails.send({
        from: import.meta.env.VERIFIED_USER,
        to: email,
        template: {
          id: 'welcome-message',
          variables: {
            name: String(name).slice(0, 100),
          },
        },
      });
    } catch (emailError) {
      console.error('Error al enviar correo de bienvenida (la suscripción fue exitosa):', emailError);
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Te has suscrito correctamente',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error en suscripción:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Error al suscribirse a la newsletter',
      debug: errorMessage,
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
