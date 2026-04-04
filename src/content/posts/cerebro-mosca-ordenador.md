---
title: "Metieron el cerebro de una mosca en un ordenador y la mosca se movió sola"
description: "En marzo de 2026, Eon Systems emulando las 125.000 neuronas de una mosca real en un cuerpo virtual. Sin IA. Sin entrenamiento. El cerebro simplemente... funcionó."
date: 2026-04-05
tags: [ia, neurociencia, cerebro, simulacion, tech]
image: "/posts/cerebro-mosca-cover.jpg"
---

Hace unas semanas leí algo que me quedé un rato mirando la pantalla sin saber muy bien qué pensar.

Una startup llamada Eon Systems anunció que había metido el cerebro completo de una mosca — 125.000 neuronas, 50 millones de sinapsis — en un cuerpo virtual. Y que la mosca se había movido sola. Sin código de comportamiento. Sin IA entrenada. El cerebro simplemente recibió señales sensoriales, procesó, y envió órdenes motoras. Como haría una mosca real.

No es ciencia ficción. Está publicado. Y creo que merece más atención de la que está recibiendo.

## De dónde viene esto

Para entender el hito hay que entender el trabajo que lo hizo posible.

En 2024, un equipo de Princeton publicó en Nature el **FlyWire connectome**: el mapa de conexiones sinápticas completo del cerebro adulto de *Drosophila melanogaster* — la mosca de la fruta. 125.000 neuronas. Cada conexión mapeada mediante microscopía electrónica, a resolución de nanómetros. Un trabajo de años.

Philip Shiu, uno de los autores de ese paper, terminó en Eon Systems. Y en 2026 publicaron lo siguiente: habían tomado ese mapa completo y lo habían simulado en un ordenador usando **Brian2**, un simulador de redes neuronales de picos. El cerebro virtual predecía comportamientos motores de la mosca real con un **91-95% de precisión**. Sin entrenar nada. Solo con la arquitectura del conectoma.

Impresionante ya de por sí. Pero eso no era el paso más raro.

## El paso raro: darle un cuerpo

Un cerebro sin cuerpo no puede hacer nada útil. Las señales no tienen adónde ir.

Entonces Eon conectó ese cerebro emulado a **NeuroMechFly v2**, un framework de la EPFL (École Polytechnique Fédérale de Lausanne) que reconstruye el cuerpo articulado de una mosca a partir de escáneres de microtomografía de rayos X. Un gemelo digital físicamente preciso, simulado en **MuJoCo** — el mismo motor de física que usa DeepMind para sus robots.

El resultado: la mosca se movió. Sin programar ningún comportamiento. La entrada sensorial entraba al cerebro emulado, la actividad neural se propagaba por el conectoma completo, y las órdenes motoras salían hacia el cuerpo virtual.

Se vio caminar. Se vio frotarse las patas. Se vio beber de un cuenco.

Comportamientos emergentes. No programados. Solo el cerebro haciendo lo que hace un cerebro.

## Por qué esto es diferente a todo lo anterior

La comparación importante es con **OpenWorm**, el proyecto más conocido de este campo. OpenWorm simuló el cerebro del *C. elegans* — un gusano con exactamente 302 neuronas — hace más de una década. Fue un hito histórico. Pero 302 neuronas vs 125.000 no es una diferencia de cantidad: es una diferencia de orden de complejidad.

La otra comparación es con el enfoque de DeepMind: en 2025 publicaron un paper donde modelaban los circuitos neuronales de una mosca usando **reinforcement learning** para controlar un cuerpo simulado. Interesante, pero es IA aprendiendo a imitar una mosca — no una mosca de verdad corriendo en un ordenador. Son cosas distintas.

Lo de Eon es diferente. No hay entrenamiento. No hay modelo que aprende. Hay un conectoma real, simulado neurona a neurona, conectado a un cuerpo físico. Si funciona, es porque el cerebro de la mosca real ya contenía la información para generar esos comportamientos.

## Qué viene después

Eon Systems tiene un objetivo declarado en dos años: **emular el cerebro de un ratón**. 70 millones de neuronas. Unas 560 veces más complejo que la mosca.

El cerebro humano tiene 86.000 millones de neuronas. Haciendo la cuenta, estamos a varios órdenes de magnitud de distancia. Pero la pregunta que me parece interesante no es "¿cuándo llegamos al cerebro humano?" sino algo más inmediato: **¿qué pasa cuando esto escala un poco más?**

Un cerebro de ratón emulado ya podría tener implicaciones serias en investigación médica — enfermedades neurodegenerativas, farmacología, desarrollo de fármacos sin necesidad de animales. Y si el comportamiento emerge de la arquitectura, empezamos a entender los mecanismos reales, no solo las correlaciones estadísticas que nos da el deep learning.

El paper original está en [arXiv:2602.17997](https://arxiv.org/abs/2602.17997). El código del modelo cerebral está en [GitHub](https://github.com/eonsystemspbc/fly-brain). La explicación del cofundador en [Substack](https://theinnermostloop.substack.com/p/the-first-multi-behavior-brain-upload).

## La pregunta que me quedé pensando

Futurism cerró su artículo sobre esto con algo que no se me va de la cabeza: ¿podríamos ser nosotros versiones más sofisticadas de esa mosca, moviéndonos en un sandbox mucho más grande?

No lo sé. Tampoco creo que lo sepamos pronto.

Pero hay algo en ver una mosca digital frotarse las patas — sin que nadie le haya dicho que lo haga, solo porque su cerebro así lo procesó — que hace que te preguntes qué significa exactamente eso de que "el cerebro funcione".

---

Para cualquier duda déjame un comentario en [**LinkedIn**](https://www.linkedin.com/in/daniel-hernandez-puerto-57a093194/) o comparte si te ha resultado útil.

¡Hasta la próxima! 👋🏽
