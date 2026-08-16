---
title: "KittenTTS: TTS de calidad en 25MB, sin GPU y gratis"
description: "Estaba buscando opciones para añadir voz a un proyecto sin montar infraestructura ni pagar APIs. Encontré KittenTTS y es exactamente lo que necesitaba."
date: 2026-04-04
tags: [python, ia, tts, open-source]
image: "./kittentts-cover.jpg"
---

Estaba mirando opciones para añadir síntesis de voz a un proyecto personal. La mayoría de soluciones o necesitan GPU, o son APIs de pago con límites, o los modelos pesan varios gigas. Para algo pequeño no tiene ningún sentido montar toda esa infraestructura.

Entonces encontré KittenTTS. Un modelo de 25MB que corre en CPU, sin GPU, sin API key, sin nada. Lo instalas, funciona, y el audio suena bien. No es ElevenLabs — eso queda claro desde el primer momento — pero para lo que yo necesitaba era más que suficiente. Y eso es lo que me parece interesante contarte.

## Qué es exactamente

Es una librería Python open-source de [KittenML](https://kittenml.com) construida sobre ONNX. La idea central es simple: TTS decente, lo más ligero posible, que no necesite GPU ni conexión a ningún servidor externo.

Tienen tres tamaños de modelo:

- **kitten-tts-nano (int8)** — 15M parámetros, **25MB**. El más pequeño.
- **kitten-tts-micro** — 40M parámetros, 41MB. El punto medio.
- **kitten-tts-mini** — 80M parámetros, 80MB. El más completo.

La versión nano en int8 es la que más me llama la atención. 25MB en disco, corre en cualquier CPU, y genera audio más rápido que en tiempo real — su RTF está alrededor de 0.8 en un portátil normal, lo que significa que genera el audio más rápido de lo que se puede escuchar. Para edge o para proyectos donde el tamaño importa, eso es bestial.

## Cómo se instala y usa

```bash
pip install https://github.com/KittenML/KittenTTS/releases/download/0.8.1/kittentts-0.8.1-py3-none-any.whl
```

```python
from kittentts import KittenTTS
import soundfile as sf

model = KittenTTS("KittenML/kitten-tts-mini-0.8")
audio = model.generate("Esto corre en CPU y pesa 25MB.", voice="Jasper")
sf.write("output.wav", audio, 24000)
```

Eso es todo. La primera vez descarga el modelo de Hugging Face, lo cachea localmente, y a partir de ahí es instantáneo. Sin API key, sin cuenta en ningún sitio, sin nada.

Tiene 8 voces incluidas: `Bella`, `Jasper`, `Luna`, `Bruno`, `Rosie`, `Hugo`, `Kiki` y `Leo`. Cuatro femeninas, cuatro masculinas. Y puedes controlar la velocidad de síntesis:

```python
# Controlar velocidad (default: 1.0)
audio = model.generate("Hola.", voice="Luna", speed=1.2)

# Guardar directamente a fichero sin pasos extra
model.generate_to_file("Hola.", "output.wav", voice="Bruno", speed=0.9)

# Ver todas las voces disponibles
print(model.available_voices)
# ['Bella', 'Jasper', 'Luna', 'Bruno', 'Rosie', 'Hugo', 'Kiki', 'Leo']
```

La salida es a 24kHz, que es más que suficiente para la mayoría de casos de uso.

## La calidad real — sin exagerar

Aquí voy a ser directo porque creo que la mayoría de artículos sobre estas cosas pecan de lo mismo: o lo ponen por las nubes o lo destrozan sin contexto.

La calidad de KittenTTS es buena **para lo que es**. El modelo nano suena correcto, inteligible, pero tiene un techo en expresividad — suena "seguro", sin mucha emoción. El mini (80M) da un salto notable y es donde yo lo pondría si el tamaño no es un problema crítico.

Comparado con otras opciones open-source:
- **Vs Piper TTS** — KittenTTS suena claramente mejor. Piper es rápido pero tiene ese sonido robótico y plano que lo hace útil solo para notificaciones o lectores de pantalla.
- **Vs Kokoro TTS** — Kokoro suena mejor, es más expresivo y más natural. Pero Kokoro necesita una máquina decente o GPU para correr bien. KittenTTS es más pequeño, más rápido, y corre en cualquier sitio.
- **Vs ElevenLabs, Azure Neural Voice** — Sin comparación. Si necesitas voces para un producto de usuario final donde la calidad percibida importa, aquí no es donde miramos.

La diferencia de KittenTTS no es la calidad máxima. Es el equilibrio: pequeño, rápido, offline, gratuito.

## Cuándo lo usaría (y cuándo no)

**Tiene sentido si:**
- Tienes un proyecto personal o interno y no quieres pagar APIs ni depender de terceros
- Necesitas que funcione offline — sin internet, sin servidor externo
- Estás en edge: Raspberry Pi, servidor sin GPU, IoT, extensiones de navegador, dispositivos con recursos limitados
- La privacidad importa y no quieres mandar audio a ningún servidor

**No lo usaría si:**
- Necesitas voces muy naturales para un producto con usuarios reales — ahí ElevenLabs o similar siguen ganando sin discusión
- Necesitas múltiples idiomas — está orientado a inglés y de momento no hay mucho más
- Necesitas la máxima velocidad posible en CPU con un solo hilo — en ese caso Matcha TTS rinde mejor en algunos benchmarks

Pero para el caso de uso que describe — TTS offline, ligero, sin dependencias externas — es la opción más limpia que he encontrado hasta ahora.

## Probarlo sin instalar nada

Antes de meterte con la instalación, puedes probarlo directamente en el navegador en [Hugging Face Spaces](https://huggingface.co/spaces/KittenML/KittenTTS-Demo). Metes texto, eliges voz, escuchas. En dos minutos sabes si te vale o no.

El proyecto está en [GitHub](https://github.com/KittenML/KittenTTS) y sigue en desarrollo activo — están en v0.8 y las mejoras entre versiones han sido notables. Vale la pena seguirlo.

---

Para cualquier duda déjame un comentario en [**LinkedIn**](https://www.linkedin.com/in/daniel-hernandez-puerto-57a093194/) o comparte si te ha resultado útil.

¡Hasta la próxima! 👋🏽
