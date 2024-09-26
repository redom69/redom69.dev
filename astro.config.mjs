import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import express from 'express';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import tailwind from '@astrojs/tailwind';
import robotsTxt from 'astro-robots-txt';
import sgClient from '@sendgrid/client';
import vercel from '@astrojs/vercel/serverless';

dotenv.config(); // Configurar variables de entorno

// Configurar SendGrid con la API Key
const sendgridApiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(sendgridApiKey);
sgClient.setApiKey(sendgridApiKey);

export default defineConfig({
  output: 'server',
  integrations: [react(), tailwind(), robotsTxt()],
  adapter: vercel(),
  site: 'https://redom69.dev',
  markdown: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
  vite: {
    plugins: [
      {
        name: 'astro-express-middleware',
        configureServer(server) {
          const app = express();
          app.use(express.json());

          // Ruta para enviar el correo de contacto
          app.post('/api/contact', async (req, res) => {
            const { name, email, message, subject } = req.body;

            const msg = {
              to: process.env.GMAIL_USER,
              from: process.env.VERIFIED_USER,
              replyTo: email,
              subject: `${subject}`,
              templateId: process.env.contactoTemplate,
              dynamic_template_data: { name, email, message },
            };

            try {
              await sgMail.send(msg);
              res.json({
                status: 'success',
                message: 'Correo enviado correctamente',
              });
            } catch (error) {
              console.error('Error al enviar el correo:', error);
              res.status(500).json({
                status: 'error',
                message: 'Error al enviar el correo',
              });
            }
          });

          // Ruta para suscribirse a la newsletter
          app.post('/api/subscribe', async (req, res) => {
            const { email, name } = req.body;

            if (!email || !name) {
              return res.status(400).json({
                status: 'error',
                message: 'El correo y el nombre son requeridos',
              });
            }

            try {
              // 1. Verificar si el contacto ya está en la lista
              const requestSearch = {
                url: '/v3/marketing/contacts/search',
                method: 'POST',
                body: { query: `email LIKE '${email}'` },
              };
              const [searchData] = await sgClient.request(requestSearch);

              if (searchData.result && searchData.result.length > 0) {
                return res.status(409).json({
                  status: 'error',
                  message: 'Este correo ya está suscrito a la newsletter',
                });
              }

              // 2. Agregar el contacto si no existe
              const addData = {
                contacts: [{ email, first_name: name }],
              };

              const addResponse = await fetch(
                'https://api.sendgrid.com/v3/marketing/contacts',
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${sendgridApiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(addData),
                }
              );

              if (!addResponse.ok) {
                const errorResponse = await addResponse.json();
                console.error('Error al agregar el contacto:', errorResponse);
                return res.status(500).json({
                  status: 'error',
                  message: 'Error al suscribirse a la newsletter',
                });
              }

              // 3. Enviar correo de bienvenida
              const msg = {
                to: email,
                from: process.env.VERIFIED_USER,
                templateId: process.env.welcomeTemplateId,
                dynamic_template_data: { email, name },
              };
              await sgMail.send(msg);

              res.json({
                status: 'success',
                message: 'Te has suscrito correctamente',
              });
            } catch (error) {
              console.error('Error en suscripción:', error);
              res.status(500).json({
                status: 'error',
                message: 'Error al suscribirse a la newsletter',
              });
            }
          });

          // Ruta para notificar sobre un nuevo post
          app.post('/api/notify-new-post', async (req, res) => {
            const { post1_title, post1_link, post2_title, post2_link } =
              req.body;

            try {
              const contactsResponse = await fetch(
                'https://api.sendgrid.com/v3/marketing/contacts',
                {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${sendgridApiKey}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              const contactsData = await contactsResponse.json();
              const emails = contactsData.result.map(
                (contact) => contact.email
              );

              const msg = {
                to: emails,
                from: process.env.VERIFIED_USER,
                templateId: process.env.newPostsTemplateId,
                dynamic_template_data: {
                  post1_title,
                  post1_link,
                  post2_title,
                  post2_link,
                },
              };

              await sgMail.sendMultiple(msg);

              res.json({
                status: 'success',
                message:
                  'Correos enviados correctamente a todos los suscriptores.',
              });
            } catch (error) {
              console.error('Error al enviar correos:', error);
              res.status(500).json({
                status: 'error',
                message: 'Error al enviar los correos',
              });
            }
          });

          // Ruta para desuscribirse
          app.post('/api/unsubscribe', async (req, res) => {
            const { email } = req.body;

            if (!email) {
              return res.status(400).json({
                status: 'error',
                message: 'El correo electrónico es requerido.',
              });
            }

            try {
              // Verificar si el contacto existe en SendGrid
              const requestSearch = {
                url: '/v3/marketing/contacts/search',
                method: 'POST',
                body: { query: `email LIKE '${email}'` },
              };
              const [searchData] = await sgClient.request(requestSearch);

              if (!searchData || searchData.result.length === 0) {
                return res.status(404).json({
                  status: 'error',
                  message: 'El correo no está suscrito.',
                });
              }

              // Si existe, eliminar el contacto de SendGrid
              const deleteRequest = {
                url: '/v3/marketing/contacts',
                method: 'DELETE',
                qs: { ids: searchData.result[0].id }, // ID del contacto encontrado
              };
              await sgClient.request(deleteRequest);

              res.json({
                status: 'success',
                message: 'Te has desuscrito correctamente.',
              });
            } catch (error) {
              console.error('Error al desuscribirse:', error);
              res.status(500).json({
                status: 'error',
                message: 'Error al procesar tu solicitud de desuscripción.',
              });
            }
          });

          server.middlewares.use(app);
        },
      },
    ],
  },
});
