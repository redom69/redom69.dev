# redom69.dev

Portfolio personal de Daniel Hernandez Puerto — proyectos, servicios, blog/newsletter y contacto.

## Stack

- [Astro](https://astro.build) (SSR, adapter de Vercel)
- Tailwind CSS (v3, vía PostCSS manual — sin `@astrojs/tailwind`)
- Content Collections para el blog (`src/content/posts`)
- [Resend](https://resend.com) para el formulario de contacto y la newsletter

## Estructura

```text
src/
├── components/   # componentes .astro (Hero, Projects, Posts, Contact, etc.)
├── content/      # posts del blog (markdown) + content.config.ts
├── layouts/      # Layout.astro (sitio) y LayoutMinimal.astro (páginas legales)
└── pages/        # rutas, incluye api/ para contacto, newsletter y notificaciones
```

## Comandos

| Comando           | Acción                                          |
| :---------------- | :---------------------------------------------- |
| `npm install`     | Instala dependencias                            |
| `npm run dev`     | Servidor local en `localhost:4321`              |
| `npm run build`   | `astro check` + build de producción a `./dist/` |
| `npm run preview` | Preview local del build de producción           |
| `npm run format`  | Formatea el proyecto con Prettier               |

## Variables de entorno

Ver `.env.local` (no versionado) — incluye `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `FORM_SECRET` y `NOTIFY_SECRET`.
