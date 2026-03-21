import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Rate limiting: máximo 3 emails por IP por hora
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hora

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) return true;

  entry.count++;
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const ip = clientAddress || 'unknown';

    // Rate limiting
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Demasiadas peticiones. Inténtalo más tarde.',
      }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }

    const { name, email, message, subject, honeypot } = await request.json();

    // Honeypot: si viene relleno es un bot
    if (honeypot) {
      return new Response(JSON.stringify({
        status: 'success',
        message: 'Correo enviado correctamente',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

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
