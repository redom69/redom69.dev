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

    const templateId = import.meta.env.newPostsTemplateId;
    if (!templateId) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Template de notificación no configurado',
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Obtener todos los contactos
    const contactsResponse = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!contactsResponse.ok) {
      console.error('Error al obtener contactos:', await contactsResponse.text());
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Error al obtener la lista de suscriptores',
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const contactsData = await contactsResponse.json();
    const contacts = contactsData.result;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return new Response(JSON.stringify({
        status: 'success',
        message: 'No hay suscriptores a los que notificar',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const emails = contacts.map((contact: { email: string }) => contact.email);

    const msg = {
      to: emails,
      from: import.meta.env.VERIFIED_USER,
      templateId,
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
      message: `Correos enviados correctamente a ${emails.length} suscriptores.`,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al enviar correos:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Error al enviar los correos',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
