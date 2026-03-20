import type { APIRoute } from 'astro';
import sgMail from '@sendgrid/mail';
import sgClient from '@sendgrid/client';

const sendgridApiKey = import.meta.env.SENDGRID_API_KEY;
sgMail.setApiKey(sendgridApiKey);
sgClient.setApiKey(sendgridApiKey);

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
    const sanitizedEmail = email.replace(/'/g, "\\'");
    const requestSearch = {
      url: '/v3/marketing/contacts/search' as const,
      method: 'POST' as const,
      body: { query: `email LIKE '${sanitizedEmail}'` },
    };

    try {
      const [searchData] = await sgClient.request(requestSearch);
      const searchBody = searchData.body as { result?: Array<{ email: string }> };

      if (searchBody.result && searchBody.result.length > 0) {
        return new Response(JSON.stringify({
          status: 'error',
          message: 'Este correo ya está suscrito a la newsletter',
        }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
    } catch (searchError) {
      console.error('Error al buscar contacto en SendGrid:', searchError);
      // Si la búsqueda falla, continuamos con la suscripción
      // para no bloquear al usuario por un error de búsqueda
    }

    // Agregar el contacto
    const addData = {
      contacts: [{ email, first_name: String(name).slice(0, 100) }],
    };

    const addResponse = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addData),
    });

    if (!addResponse.ok) {
      console.error('Error al agregar el contacto:', await addResponse.json());
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Error al suscribirse a la newsletter',
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Enviar correo de bienvenida (no bloquea la suscripción si falla)
    const welcomeTemplateId = import.meta.env.welcomeTemplateId;
    if (welcomeTemplateId) {
      try {
        const msg = {
          to: email,
          from: import.meta.env.VERIFIED_USER,
          templateId: welcomeTemplateId,
          dynamic_template_data: { email, name: String(name).slice(0, 100) },
        };
        await sgMail.send(msg);
      } catch (emailError) {
        console.error('Error al enviar correo de bienvenida (la suscripción fue exitosa):', emailError);
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Te has suscrito correctamente',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error en suscripción:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Error al suscribirse a la newsletter',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
