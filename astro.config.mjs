import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import express from 'express';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv'; // Para cargar las variables de entorno

dotenv.config(); // Cargar el archivo .env

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [
      {
        name: 'astro-express-middleware',
        configureServer(server) {
          const app = express();
          app.use(express.json());

          // Configurar SendGrid con tu API Key
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);

          // Ruta API para enviar el correo
          app.post('/api/contact', async (req, res) => {
            const { name, email, message,subject } = req.body;

            // Crear el objeto de datos para la plantilla de SendGrid
            const msg = {
              to: process.env.GMAIL_USER,  // Destinatario: GMAIL_USER desde las variables de entorno
              from:  process.env.VERIFIED_USER,   // Remitente: correo verificado en SendGrid
              replyTo: email,  // Correo del usuario que llenó el formulario
              subject: `${subject}`,  // Asunto dinámico (usando template literals)
              templateId: process.env.contactoTemplate,  // El ID de la plantilla
              dynamic_template_data: {
                name: name,
                email: email,
                message: message,
              },
            };

            try {
              // Enviar el correo utilizando la plantilla
              await sgMail.send(msg);
              res.json({ status: 'success', message: 'Correo enviado correctamente' });
            } catch (error) {
              console.error('Error al enviar el correo:', error);
              res.status(500).json({ status: 'error', message: 'Error al enviar el correo' });
            }
          });

          server.middlewares.use(app);
        },
      },
    ],
  },
});
