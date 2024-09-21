import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import express from 'express';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import tailwind from '@astrojs/tailwind';
import robotsTxt from 'astro-robots-txt';

dotenv.config();

export default defineConfig({
  output: 'server',
  integrations: [react(), tailwind(), robotsTxt()],
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

          // Configurar SendGrid con tu API Key
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);

          // Ruta API para enviar el correo de contacto
          app.post('/api/contact', async (req, res) => {
            const { name, email, message, subject } = req.body;

            const msg = {
              to: process.env.GMAIL_USER, // Destinatario
              from: process.env.VERIFIED_USER, // Remitente
              replyTo: email, // Correo del usuario
              subject: `${subject}`, // Asunto dinámico
              templateId: process.env.contactoTemplate, // El ID de la plantilla
              dynamic_template_data: {
                name: name,
                email: email,
                message: message,
              },
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

          // Nueva ruta API para suscripción a la newsletter
          app.post('/api/subscribe', async (req, res) => {
            const { email, name } = req.body;

            // Verificar que el correo y el nombre están presentes
            if (!email || !name) {
              return res.status(400).json({
                status: 'error',
                message: 'El correo y el nombre son requeridos',
              });
            }

            try {
              // 1. Buscar el contacto en SendGrid para ver si ya está suscrito
              const searchResponse = await fetch(
                'https://api.sendgrid.com/v3/marketing/contacts/search',
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    query: `email LIKE '${email}'`, // Buscar por correo electrónico
                  }),
                }
              );

              const searchData = await searchResponse.json();

              if (searchData.result && searchData.result.length > 0) {
                // Si el correo ya está en la lista de contactos, devolver un mensaje
                return res.status(409).json({
                  status: 'error',
                  message: 'Este correo ya está suscrito a la newsletter.',
                });
              }

              // 2. Si el contacto no existe, agregarlo a la lista de contactos de SendGrid con nombre
              const data = {
                contacts: [
                  {
                    email: email,
                    first_name: name, // Agregar el nombre al contacto
                  },
                ],
              };

              const addResponse = await fetch(
                'https://api.sendgrid.com/v3/marketing/contacts',
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                }
              );

              if (addResponse.ok) {
                // 3. Enviar correo de bienvenida
                const msg = {
                  to: email,
                  from: process.env.VERIFIED_USER, // Asegúrate de que sea un correo verificado en SendGrid
                  templateId: process.env.welcomeTemplateId, // Template ID de SendGrid para el correo de bienvenida
                  dynamic_template_data: {
                    email: email,
                    name: name, // Pasar también el nombre al correo
                  },
                };

                await sgMail.send(msg);

                // Responder que se ha suscrito correctamente
                return res.json({
                  status: 'success',
                  message:
                    'Te has suscrito correctamente a la newsletter y se ha enviado un correo de bienvenida.',
                });
              } else {
                const errorResponse = await addResponse.json();
                console.error(
                  'Error de SendGrid al agregar el contacto:',
                  errorResponse
                );
                return res.status(500).json({
                  status: 'error',
                  message: 'Error al suscribirse a la newsletter',
                });
              }
            } catch (error) {
              console.error('Error al suscribir el correo:', error);
              return res.status(500).json({
                status: 'error',
                message: 'Error al suscribir el correo',
              });
            }
          });

          // Api para mandar correo con nuevo post
          app.post('/api/notify-new-post', async (req, res) => {
            const { post1_title, post1_link, post2_title, post2_link } =
              req.body;

            try {
              // Obtener todos los contactos desde SendGrid
              const contactsResponse = await fetch(
                'https://api.sendgrid.com/v3/marketing/contacts',
                {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              const contactsData = await contactsResponse.json();
              const emails = contactsData.result.map(
                (contact) => contact.email
              );

              // Enviar el correo a todos los contactos
              const msg = {
                to: emails, // Lista de correos electrónicos
                from: process.env.VERIFIED_USER,
                templateId: process.env.newPostsTemplateId, // Plantilla de correo
                dynamic_template_data: {
                  post1_title: post1_title,
                  post1_link: post1_link,
                  post2_title: post2_title,
                  post2_link: post2_link,
                },
              };

              await sgMail.sendMultiple(msg);

              res.json({
                status: 'success',
                message:
                  'Correos enviados correctamente a todos los suscriptores',
              });
            } catch (error) {
              console.error('Error al enviar correos:', error);
              res.status(500).json({
                status: 'error',
                message: 'Error al enviar los correos',
              });
            }
          });

          app.get('/api/likes/:slug', (req, res) => {
            const { slug } = req.params;
            const data = fs.readFileSync('likes.json');
            const likesData = JSON.parse(data);

            if (!likesData.posts[slug]) {
              likesData.posts[slug] = { likes: 0 };
              fs.writeFileSync('likes.json', JSON.stringify(likesData));
            }

            res.json({ likes: likesData.posts[slug].likes });
          });

          // Ruta para actualizar los likes de un post específico
          app.post('/api/likes/:slug', (req, res) => {
            const { slug } = req.params;
            const { action } = req.body;

            const data = fs.readFileSync('likes.json');
            const likesData = JSON.parse(data);

            if (!likesData.posts[slug]) {
              likesData.posts[slug] = { likes: 0 };
            }

            if (action === 'increment') {
              likesData.posts[slug].likes++;
            } else if (action === 'decrement') {
              likesData.posts[slug].likes--;
            }

            fs.writeFileSync('likes.json', JSON.stringify(likesData));
            res.json({ likes: likesData.posts[slug].likes });
          });

          server.middlewares.use(app);
        },
      },
    ],
  },
});
