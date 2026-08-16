---
title: 'TypeScript estricto o flexible: dónde pongo la línea'
description: 'Mi opinión después de años trabajando con TypeScript a diario — cuándo strict mode es innegociable y cuándo hay que ser pragmático.'
date: 2026-03-22
image: './typescript-strict.png'
tags: [typescript, opinion, buenas-practicas]
---

Cuando empecé a trabajar con TypeScript en serio, asumí que poner `"strict": true` en el `tsconfig.json` era lo básico. Y lo es — pero nadie me explicó bien qué activa exactamente ni por qué cada opción importa.

Mi filosofía es simple: si empiezo un proyecto de cero, se hace bien desde el principio. Strict mode activado, tipos en todas partes, `any` prohibido. No hay excusa.

## **¿Qué activa `strict: true`?**

Cuando pones `"strict": true` en tu tsconfig, estás activando un paquete de opciones de golpe. Las más relevantes en el día a día:

- **`noImplicitAny`** — TypeScript no puede inferir `any` sin que tú lo escribas explícitamente
- **`strictNullChecks`** — `null` y `undefined` son tipos propios, no se cuelan silenciosamente
- **`strictPropertyInitialization`** — las propiedades de clase deben inicializarse en el constructor
- **`useUnknownInCatchVariables`** — los errores del `catch` son `unknown`, no `any`

Cada una tiene su motivo. Pero no todas pesan igual en el día a día.

## **`noImplicitAny`: la que más me importa**

Esta es mi favorita. No tolero `any` implícito en mi código — si TypeScript no puede inferir el tipo solo, me para y me obliga a pensar. Y eso es exactamente lo que quiero.

```typescript
// Esto no compila con noImplicitAny ✅
function procesar(datos) {
  // Error: datos tiene tipo any implícito
  return datos.nombre;
}

// Así sí
function procesar(datos: Usuario) {
  return datos.nombre;
}
```

Los tipos no son burocracia. Son documentación en vivo que el compilador verifica por ti.

## **`strictNullChecks`: sin negociación**

El famoso "billion-dollar mistake" — el `null` que se cuela donde no debería y explota en runtime. Con `strictNullChecks` el compilador te para antes:

```typescript
const user = getUser(); // User | null

console.log(user.name); // 💥 Error: user podría ser null
console.log(user?.name); // ✅
```

En proyectos nuevos, activarla desde el día uno no cuesta nada. En proyectos heredados puede generarte cientos de errores de golpe — pero merece la pena limpiarlos.

## **¿Uso `any` alguna vez?**

Jamás. Salvo que reciba un proyecto tan mal tipado que recuperar los tipos sea inviable en ese momento — y en ese caso lo escribo yo explícitamente y sé exactamente por qué lo hago. Nunca dejo que TypeScript lo infiera solo.

## **Cuando recibo código de otro dev**

Depende del proyecto. Si es mío y tengo tiempo, le doy el cariño que merece — refactorizo bien, activo strict, limpio los tipos. Si es un proyecto de trabajo con prisa, voy poco a poco: primero que funcione, luego que esté bien.

Pero si el proyecto es mío, me gusta hacerlo bien. Los tipos son parte de hacer las cosas bien.

## **Mi tsconfig base para proyectos nuevos**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Puede parecer mucho, pero en un proyecto nuevo el coste es cero — simplemente escribes con tipos desde el principio.

## **La conclusión**

Si empiezas un proyecto desde cero: strict desde el día uno, sin excepción. Si recibes código heredado: estrategia progresiva según el tiempo y el proyecto. `any` implícito nunca — si lo usas, que sea una decisión consciente tuya, no un default del compilador.

![This is fine - TypeScript any en producción](./meme-typescript-any.jpg)

---

Para cualquier duda déjame un comentario en [**LinkedIn**](https://www.linkedin.com/in/daniel-hernandez-puerto-57a093194/) o comparte si te ha resultado útil.

¡Hasta la próxima! 👋🏽
