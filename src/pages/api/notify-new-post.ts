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

    const { post1_title, post1_link, post2_title, post2_link } = await request.json();

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
    const templateVariables = { post1_title, post1_link, post2_title, post2_link };

    // Enviar en batches de 100 (límite de Resend batch API)
    const BATCH_SIZE = 100;
    let totalSent = 0;

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);
      const emails = batch.map((contact: { email: string }) => ({
        from,
        to: contact.email,
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
