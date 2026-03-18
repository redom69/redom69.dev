---
title: "Cómo crear y configurar tu propio asistente de IA con OpenClaw"
description: "Te cuento cómo monté mi propio agente de IA personal desde cero, con personalidad, memoria y acceso desde Telegram."
date: 2026-03-18
image: "/posts/openclaw-ia.jpg"
---

Hace poco decidí montar mi propio asistente de IA personal, uno que realmente fuera *mío*: con mi personalidad, mis preferencias, acceso a mis herramientas y disponible desde Telegram. Después de investigar un rato, di con **OpenClaw** y la verdad es que me voló la cabeza.

En este post te cuento cómo lo configuré desde cero, por qué lo elegí y qué puedes hacer con él.

## **¿Qué es OpenClaw?**

OpenClaw es una plataforma que te permite desplegar tu propio agente de IA en un servidor (o tu propia máquina), conectarlo a modelos como Claude o GPT, y hablarle desde canales como **Telegram, Signal o WhatsApp**.

No es solo un chatbot. Es un sistema con memoria, personalidad configurable, skills instalables y acceso a herramientas reales: puede ejecutar código, buscar en la web, leer archivos, y mucho más.

## **Instalación**

Lo primero es tener **Node.js** (v18+) en tu máquina o VPS. Después, instalar OpenClaw es tan sencillo como:

```bash
npm install -g openclaw
```

Una vez instalado, arrancas el gateway:

```bash
openclaw gateway start
```

Y ya tienes el núcleo funcionando.

## **Configuración básica**

OpenClaw usa un workspace de archivos Markdown para definir cómo se comporta tu agente. Los más importantes son:

- **`SOUL.md`** → La personalidad de tu asistente. Aquí defines su nombre, tono, cómo habla, qué puede hacer.
- **`USER.md`** → Información sobre ti: tu nombre, zona horaria, preferencias, tecnologías que usas.
- **`MEMORY.md`** → Memoria persistente. El agente la actualiza y consulta para recordar contexto entre conversaciones.
- **`AGENTS.md`** → Reglas de seguridad: qué puede hacer solo y qué necesita tu confirmación.

Ejemplo de `SOUL.md` básico:

```markdown
# Mi Asistente

Eres un asistente técnico especializado en desarrollo web.

## Personalidad
- Directo y eficiente
- Técnico pero claro
- Respondes en español

## Reglas
- Pide confirmación antes de enviar emails o borrar archivos
- Nunca compartas credenciales
```

## **Conectarlo a Telegram**

Una de las cosas que más me gustó: conectarlo a Telegram en minutos.

1. Habla con **@BotFather** en Telegram y crea un bot nuevo (`/newbot`)
2. Copia el token que te da
3. Configúralo en OpenClaw:

```bash
openclaw config set telegram.token TU_TOKEN_AQUI
openclaw gateway restart
```

Y listo. Puedes hablarle desde Telegram como si fuera un contacto más, y tiene acceso a todo lo que hayas configurado en tu workspace.

## **Skills: extendiendo las capacidades**

OpenClaw tiene un sistema de skills que amplía lo que puede hacer tu agente. Se instalan con el CLI de ClawHub:

```bash
npx clawhub install weather
npx clawhub install tmux
```

Puedes encontrar más skills en [clawhub.com](https://clawhub.com).

## **¿Por qué OpenClaw y no otra cosa?**

Hay muchas alternativas (n8n, AutoGPT, etc.), pero lo que me convenció de OpenClaw es que el agente vive *en tu servidor*, tiene *tu personalidad*, y tú controlas exactamente qué puede y qué no puede hacer. No dependes de ningún servicio externo para la lógica del agente.

Si eres developer y te gusta tener el control de tus herramientas, merece la pena probarlo.

---

Para cualquier duda, déjame un comentario en [**LinkedIn**](https://www.linkedin.com/in/daniel-hernandez-puerto-57a093194/) o comparte la newsletter si te ha resultado útil.

¡Hasta la próxima! 👋🏽
