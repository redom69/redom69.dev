import type { APIRoute } from 'astro';
import sgMail from '@sendgrid/mail';

const sendgridApiKey = import.meta.env.SENDGRID_API_KEY;
sgMail.setApiKey(sendgridApiKey);

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

    const msg = {
      to: import.meta.env.GMAIL_USER,
      from: import.meta.env.VERIFIED_USER,
      replyTo: email,
      subject: String(subject).slice(0, 200),
      templateId: import.meta.env.contactoTemplate,
      dynamic_template_data: {
        name: String(name).slice(0, 100),
        email,
        message: String(message).slice(0, 5000),
      },
    };

    await sgMail.send(msg);

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
