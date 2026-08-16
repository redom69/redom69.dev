---
title: 'Cómo solucioné el procesamiento de audios en mi asistente de IA'
description: 'Llevaba tiempo queriendo hablarle a mi asistente por nota de voz. Lo que parecía simple se convirtió en una odisea. Te cuento cómo lo resolví.'
date: 2026-03-24
image: './openclaw-whisper.webp'
tags: [ia, whisper, audio, openclaw, asistente]
---

Llevaba tiempo queriendo hablarle a mi asistente por nota de voz desde el móvil. Simple, ¿no? Pues no tanto.

## **Lo que pasaba**

Mandabas un audio y nada. Silencio total. Sin respuesta, sin error, sin ningún tipo de señal de que algo había llegado. Y en los casos en que sí respondía, un audio de 15 segundos tardaba casi 5 minutos en procesarse.

Pero lo que más me fastidiaba no era que tardara — era no saber qué estaba pasando. ¿Llegó? ¿Falló? ¿Está procesando? Cero feedback. Eso es lo que más mata.

## **No era solo yo**

Antes de ponerme a investigar a lo loco, busqué si alguien más había tenido el mismo problema. Y vaya si lo había tenido.

En el repositorio de OpenClaw encontré varios issues abiertos hablando exactamente de esto:

- **Issue #7899** — "Telegram voice messages not being transcribed"
- **Issue #22554** — "Audio processing pipeline not triggered for OGG/Opus files"
- **Issue #1989** — El plugin de Telegram no llamaba a `applyMediaUnderstanding`

El fallo estaba en el plugin de Telegram de OpenClaw. El audio llegaba al servidor, se guardaba bien, pero el pipeline de transcripción nunca se activaba. El asistente ni se enteraba de que había llegado un mensaje de voz.

## **El game changer: un skill de un tío en ClawHub**

Aquí es donde cambia todo. Mientras investigaba encontré en [ClawHub](https://clawhub.com) un skill llamado **`tg-voice-whisper`**. El README estaba en ruso, pero el código era exactamente lo que necesitaba.

La solución era simple y elegante: en vez de esperar a que OpenClaw activara el pipeline (que estaba roto), montas un proceso que revisa la carpeta de entrada cada pocos segundos. Si detecta un audio nuevo, lo transcribe directamente con Whisper y se lo pasa al agente. Te saltas el bug por completo.

Eso fue el punto de inflexión. A partir de ahí solo quedaba adaptarlo y hacerlo robusto.

![Desarrollador esperando a que cargue Whisper](./meme-whisper-cansado.webp)

## **Cómo lo montamos**

El primer problema después de entender la solución era la velocidad. Whisper tarda 1-2 minutos en cargar el modelo cada vez que lo llamas. La solución: un servidor local que mantiene el modelo en memoria. Lo arrancas una vez y cada transcripción tarda ~6 segundos.

El watcher revisa la carpeta cada 2 segundos. Audio nuevo → transcripción → respuesta del asistente. Ambos servicios corren como systemd — arrancan solos al inicio y se reinician si se caen.

## **Cómo está ahora**

- Audios cortos (~15s): **6-8 segundos** de respuesta
- Audios de 1-2 minutos: **15-25 segundos**
- Detecta el idioma automáticamente
- Si el plugin falla, el watcher lo cubre solo

No es perfecto — el bug del plugin sigue ahí y con audios de más de 3 minutos puede haber problemas. Pero para el día a día va de sobra.

**Lo que me llevo:** cuando algo no funciona, antes de reinventarte busca si alguien ya lo resolvió. GitHub y comunidades como ClawHub tienen muchas veces la solución que necesitas. En este caso el game changer fue el skill de un tío que había tenido exactamente el mismo problema que yo.

---

Para cualquier duda déjame un comentario en [**LinkedIn**](https://www.linkedin.com/in/daniel-hernandez-puerto-57a093194/) o comparte si te ha resultado útil.

¡Hasta la próxima! 👋🏽
