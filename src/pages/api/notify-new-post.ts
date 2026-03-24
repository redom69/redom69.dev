import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  const NOTIFY_SECRET = process.env.NOTIFY_SECRET;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  try {
    // Proteger con token secreto — acepta X-Notify-Secret o Authorization: Bearer <token>
    const customHeader = request.headers.get('X-Notify-Secret');
    const authHeader = request.headers.get('Authorization');
    const token = customHeader ?? (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
    if (!NOTIFY_SECRET || token !== NOTIFY_SECRET) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'No autorizado',
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const {
      post1_title, post1_link, post1_image = '', post1_description = '',
      post2_title = '', post2_link = '', post2_image = '', post2_description = '',
    } = await request.json();

    const subject = post1_title ?? 'Nuevas publicaciones en redom69.dev';

    // Obtener todos los contactos de la audiencia
    const { data: contactsList, error: listError } = await resend.contacts.list({ audienceId });

    if (listError) {
      console.error('Error al obtener contactos:', listError);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Error al obtener la lista de suscriptores',
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const contacts = contactsList?.data;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return new Response(JSON.stringify({
        status: 'success',
        message: 'No hay suscriptores a los que notificar',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const from = process.env.VERIFIED_USER;
    const templateVariables = {
      POST1_TITLE: post1_title,
      POST1_LINK: post1_link,
      POST1_IMAGE: post1_image ? `https://redom69.dev${post1_image}` : '',
      POST1_DESCRIPTION: post1_description,
      POST2_TITLE: post2_title,
      POST2_LINK: post2_link,
      POST2_IMAGE: post2_image ? `https://redom69.dev${post2_image}` : '',
      POST2_DESCRIPTION: post2_description,
    };

    // Enviar en batches de 100 (límite de Resend batch API)
    const BATCH_SIZE = 100;
    let totalSent = 0;

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);
      const emails = batch.map((contact: { email: string }) => ({
        from,
        to: contact.email,
        subject,
        template: {
          id: 'weekly-updates-1',
          variables: templateVariables,
        },
      }));

      const { error: batchError } = await resend.batch.send(emails);
      if (batchError) {
        console.error(`Error en batch ${i / BATCH_SIZE + 1}:`, batchError);
      } else {
        totalSent += batch.length;
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: `Correos enviados correctamente a ${totalSent} suscriptores.`,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al enviar correos:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Error al enviar los correos',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
