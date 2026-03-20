import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const RECAPTCHA_SECRET_KEY = import.meta.env.RECAPTCHA_SECRET_KEY;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, message, subject, recaptchaToken } = await request.json();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Todos los campos son requeridos',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Email no válido',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Verificar reCAPTCHA server-side
    if (RECAPTCHA_SECRET_KEY) {
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      });
      const recaptchaData = await recaptchaResponse.json();

      if (!recaptchaData.success) {
        return new Response(JSON.stringify({
          status: 'error',
          message: 'Verificación reCAPTCHA fallida',
        }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const sanitizedName = String(name).slice(0, 100);
    const sanitizedSubject = String(subject).slice(0, 200);
    const sanitizedMessage = String(message).slice(0, 5000);

    await resend.emails.send({
      from: import.meta.env.VERIFIED_USER,
      to: import.meta.env.GMAIL_USER,
      replyTo: email,
      subject: sanitizedSubject,
      template: {
        id: 'feedback-notification',
        variables: {
          name: sanitizedName,
          subject: sanitizedSubject,
          message: sanitizedMessage,
        },
      },
    });

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Correo enviado correctamente',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Error al enviar el correo',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
