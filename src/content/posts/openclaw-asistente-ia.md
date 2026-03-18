---
title: "Cómo monté mi propio asistente de IA personal con OpenClaw"
description: "Llevo un tiempo con ganas de tener un asistente que realmente fuera mío. Te cuento cómo lo hice y qué me encontré por el camino."
date: 2026-03-18
image: "/posts/openclaw-ia.jpg"
---

Llevaba tiempo con ganas de montar algo así. No un chatbot genérico, sino algo que fuera realmente *mío*: que me conociera, que recordara lo que le digo, que pudiera hablarle desde el móvil y que tuviera acceso a mis herramientas. La típica idea que tienes en la cabeza pero que vas postergando porque "hay cosas más urgentes".

Pues bien, me puse a ello. Y di con **OpenClaw**.

## Lo que quería (y por qué no me servía lo de siempre)

Había probado cosas antes. ChatGPT está bien para consultas rápidas, pero no tiene memoria real entre conversaciones y no puede tocar nada de mi entorno. Claude igual. Los wrappers de n8n o Make me parecían demasiado complejos para lo que quería montar.

Lo que yo necesitaba era algo que corriera **en mi propio servidor**, que pudiera personalizar a fondo y que me hablara por **Telegram** sin que yo tuviera que abrir ninguna aplicación extra. OpenClaw cumplía exactamente eso.

## La instalación, más fácil de lo que pensaba

Tengo un VPS en Hetzner donde ya tenía varias cosas corriendo, así que lo monté ahí directamente. Solo necesitas **Node.js v18 o superior** instalado.

```bash
npm install -g openclaw
openclaw gateway start
```

Y ya está. El gateway arranca y tu agente está escuchando. La primera vez me sorprendió lo rápido que fue, la verdad.

## El workspace: aquí es donde pasa la magia

Lo que más me gustó de OpenClaw es que se configura con archivos Markdown. Nada de interfaces raras ni paneles de admin. Editas ficheros de texto y el agente los lee.

Los más importantes son:

**`SOUL.md`** — La personalidad. Aquí decides quién es tu asistente: cómo habla, qué tono tiene, qué puede y qué no puede hacer sin pedirte permiso. Yo le puse bastante detalle y la diferencia es brutal comparado con dejarlo por defecto.

**`USER.md`** — Información sobre ti. Tu zona horaria, tus preferencias, las tecnologías que usas, cómo quieres que te trate. Al principio me pareció raro escribir sobre mí mismo para que me lo leyera mi propio asistente, pero tiene mucho sentido.

**`MEMORY.md`** — Memoria persistente entre conversaciones. El agente la actualiza y la consulta. Esto es lo que hace que no tengas que repetirte cada vez que empiezas una nueva sesión.

**`AGENTS.md`** — Las reglas de seguridad. Qué puede hacer solo y qué necesita que tú confirmes. Aquí me puse bastante estricto: nada de enviar emails, hacer push a repos o borrar archivos sin que yo lo apruebe primero.

## Conectarlo a Telegram

Este paso me lo esperaba más complicado y fue lo más rápido de todo.

Hablas con **@BotFather** en Telegram, creas un bot nuevo con `/newbot`, copias el token y lo configuras:

```bash
openclaw config set telegram.token TU_TOKEN
openclaw gateway restart
```

Y ya tienes a tu asistente en Telegram como si fuera un contacto más. Le mandé un mensaje de prueba y respondió al momento. Esa sensación de tener algo tuyo funcionando en tu servidor y responderte en el móvil tiene algo especial.

## Las skills

OpenClaw tiene un sistema de skills que puedes instalar para ampliar lo que hace tu agente. Hay de todo: clima, control de sesiones tmux, búsqueda web...

```bash
npx clawhub install weather
npx clawhub install tmux
```

Puedes ver todas las disponibles en [clawhub.com](https://clawhub.com). También puedes crear las tuyas propias, que es algo que tengo pendiente de explorar.

## ¿Vale la pena montarlo?

Depende de lo que busques. Si quieres algo rápido sin complicaciones, probablemente ChatGPT o Claude te sirva. Pero si eres developer, te gusta tener el control de tus herramientas y la idea de tener un agente que vive en tu infra y hace cosas reales en tu nombre te llama la atención, OpenClaw merece mucho la pena.

Yo llevo usándolo a diario y ya no concibo no tenerlo. Desde que le mandé el primer audio por Telegram y me respondió correctamente, supe que esto era lo que quería.

---

Si tienes dudas o quieres que profundice en alguna parte del proceso, déjame un comentario en [**LinkedIn**](https://www.linkedin.com/in/daniel-hernandez-puerto-57a093194/) o comparte la newsletter si te ha resultado útil.

¡Hasta la próxima! 👋🏽
