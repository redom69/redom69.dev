import type { APIRoute } from 'astro';
import sgMail from '@sendgrid/mail';

const sendgridApiKey = import.meta.env.SENDGRID_API_KEY;
const NOTIFY_SECRET = import.meta.env.NOTIFY_SECRET;
sgMail.setApiKey(sendgridApiKey);

export const POST: APIRoute = async ({ request }) => {
  try {
    // Proteger con token secreto
    const authHeader = request.headers.get('Authorization');
    if (!NOTIFY_SECRET || authHeader !== `Bearer ${NOTIFY_SECRET}`) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'No autorizado',
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { post1_title, post1_link, post2_title, post2_link } = await request.json();

    // Obtener todos los contactos
    const contactsResponse = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const contactsData = await contactsResponse.json();
    const emails = contactsData.result.map((contact: { email: string }) => contact.email);

    const msg = {
      to: emails,
      from: import.meta.env.VERIFIED_USER,
      templateId: import.meta.env.newPostsTemplateId,
      dynamic_template_data: {
        post1_title,
        post1_link,
        post2_title,
        post2_link,
      },
    };

    await sgMail.sendMultiple(msg);

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Correos enviados correctamente a todos los suscriptores.',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al enviar correos:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Error al enviar los correos',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
