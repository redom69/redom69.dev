---
title: "Entendiendo la Diferencia entre (===) y (==) en JavaScript"
description: "Una pequeña aclaración para aquellas personas que, como yo, tienen algunas dudas."
date: 2024-09-21
image: "/posts/image.webp"
---

Esta será mi primera contribución a esta nueva newsletter. Este es un proyecto que estoy intentando llevar a cabo con el objetivo de que personas dentro del mundo de la programación puedan compartir y aprender nuevos conocimientos de manera colaborativa.

El propósito principal de la newsletter es transmitiros aquellos conceptos que en su momento me ayudaron a entender mejor el porqué de ciertas prácticas y, poco a poco, me permitieron convertirme en un mejor desarrollador.

Yo comencé en el mundo de la programación con **Java**, un lenguaje orientado a objetos. Al no tener ninguna noción previa de lógica de programación, mi forma de pensar automáticamente se alineaba con la programación orientada a objetos. Más tarde, me encontré con **JavaScript** cuando decidí enfocar mi carrera hacia el desarrollo web, especializándome en este lenguaje. Al principio, me resultaba complicado asimilar el concepto de los **tipos de datos** en JavaScript, especialmente cuando descubrí que no solo comparas el valor, sino también el tipo. En ese momento, mi mente explotó y pensé: "¡Guau, qué potente es esto!". Fue entonces cuando decidí profundizar y aprender todo lo que pudiera sobre este lenguaje, lo que despertó aún más mi curiosidad por sus capacidades.

## **Operadores de comparación en JavaScript**

Cuando comencé en el mundo de la programación, especialmente en JavaScript, se me hizo bastante complicado aprender las estructuras, los tipos y las particularidades de este lenguaje. Pero, sobre todo, una de las cosas que más me costó entender fue la diferencia entre los operadores de comparación (`==`) y (`===`).

Son comparadores que usaba diariamente, pero no comprendía realmente la diferencia entre ellos, ¡y es justamente eso lo que vengo a explicar hoy!

### **Operador de Igualdad Abstracta (`==`)**

Comencemos con el operador de igualdad abstracta. Este es el operador básico de comparación que conocemos en casi todos los lenguajes de programación. Lo que hace es comparar los valores intentando convertirlos al mismo tipo, un proceso llamado **coerción de tipos**.

Pero, ¿qué es exactamente la coerción de tipos? En programación, y específicamente en JavaScript, la coerción de tipos consiste en transformar un tipo de dato en otro para poder realizar una operación.

El resultado de este proceso es que el lenguaje transforma automáticamente ciertos valores de un tipo a otro, permitiendo que la operación o comparación funcione.

```javascript
5 == "5"; // true
true == 1; // true
null == undefined; // true
```

### **Operador de Igualdad Estricta (`===`)**

Una vez entendido el operador de igualdad abstracta, pasemos al operador de igualdad estricta. A diferencia del primero, este operador no solo compara los valores, sino también los tipos de datos.

Esta comparación es más estricta, y ambos valores tienen que ser del mismo tipo para que se considere que son iguales. Este enfoque es más seguro y preciso a la hora de evitar confusiones y errores.

```javascript
5 === "5"; // false
true === 1; // false
null === undefined; // false
```

### **¿Cuándo usar cada uno?**

Sabiendo todo esto, ¿cuándo deberíamos utilizar uno u otro? La elección depende del programador, pero si seguimos las **buenas prácticas** en JavaScript o TypeScript, se recomienda usar siempre (`===`). Esto nos permite evitar errores relacionados con la conversión automática de tipos. Utilizar (`===`) hace que tu código sea más **predecible** y menos propenso a errores difíciles de detectar, especialmente aquellos que tienen que ver con los tipos de datos, que suelen ser una fuente constante de dolores de cabeza.

<img alt="meme de spiderman señalando" title="spiderman meme señalando" loading="lazy" width="4096" height="3072" decoding="async" data-nimg="1" style="color:transparent;width:100%;height:auto;" sizes="100vw" srcset="https://hips.hearstapps.com/hmg-prod/images/spiderman-meme-1630319444.jpg?resize=640:* 640w, https://hips.hearstapps.com/hmg-prod/images/spiderman-meme-1630319444.jpg?resize=768:* 980w, https://hips.hearstapps.com/hmg-prod/images/spiderman-meme-1630319444.jpg?resize=980:* 1120w" src="https://hips.hearstapps.com/hmg-prod/images/spiderman-meme-1630319444.jpg?resize=980:*" class="css-0 e193vzwj0">

---

Para finalizar este post, me gustaría pedirte que, si te ha gustado este pequeño consejo, dejes un comentario en [**LinkedIn**](https://www.linkedin.com/in/daniel-hernandez-puerto-57a093194/) o compartas la newsletter para que más personas puedan aprender estos conceptos.

¡Sin más que añadir, me despido! Un saludo y hasta la próxima.👋🏽
