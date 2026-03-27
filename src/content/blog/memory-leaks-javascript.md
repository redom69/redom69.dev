---
title: "Memory Leaks en JavaScript: el bug que no ves hasta que es tarde"
description: "La app va lenta sin razón, el servidor se cae cada pocas horas y reinicias el proceso como si nada. Spoiler: tienes una fuga de memoria. Te cuento cómo detectarla y eliminarla."
date: 2026-03-26
tags: [javascript, performance, debugging]
image: "/posts/memory-leaks-cover.webp"
---

Hace un tiempo estaba trabajando en una app que generaba reportes en PDF usando jsPDF. Tablas con un montón de datos, imágenes en HD sin comprimir — PDFs de 50MB en algunos casos. Generabas el reporte, lo descargabas, salías. Hasta aquí todo bien.

El problema llegaba cuando volvías a generar otro. El estado anterior no se limpiaba — el componente se quedaba montado en memoria, los datos de las tablas cacheados, las imágenes también. Generabas un segundo PDF y se apilaba encima del primero. Luego un tercero. La memoria subía y subía hasta que el navegador petaba.

Sin error en los logs. Sin stack trace. Solo la app cada vez más lenta hasta que se caía.

El fix fue una combinación de cosas: desmontar el componente correctamente después de cada generación, limpiar el estado de las tablas en el cleanup, y comprimir las imágenes antes de pasarlas al PDF. Pero lo que más impacto tuvo fue simplemente asegurarse de que el componente se desmontaba de verdad — que el GC podía hacer su trabajo.

Esa experiencia me hizo entender de verdad qué es un memory leak. No es un bug que explota de golpe — se acumula en silencio hasta que ya no hay vuelta atrás.

---

## **¿Qué es exactamente un memory leak?**

JavaScript tiene garbage collector (GC). Se supone que limpia sola la memoria de los objetos que ya no usas. El problema es cuando, sin querer, mantienes una referencia a algo que ya no necesitas — el GC lo ve como "accesible" y no lo toca.

El resultado: el heap crece sin parar. La app va más lenta. Y en Node.js, el proceso revienta.

Lo que más me costó entender al principio es que no es un bug que explota de golpe. Es acumulativo. Se va acumulando hasta que el sistema ya no aguanta.

---

## **Los 5 culpables que más me he encontrado**

### **1. Variables globales accidentales**

El más tonto pero el que más veces he visto en código de otros — y alguna vez en el mío.

```typescript
// ❌ MAL — 'datos' acaba en window/global sin que te des cuenta
function procesarRespuesta(response: Response) {
  datos = response.json() // sin const/let — variable global accidental
}

// ✅ BIEN
function procesarRespuesta(response: Response) {
  const datos = response.json()
}
```

Con `strict: true` en TypeScript esto falla en compilación directamente. Otra razón para no desactivarlo nunca.

En Node.js es especialmente peligroso — cualquier cosa que metes en `global` vive todo el tiempo que vive el proceso.

---

### **2. Event listeners sin limpiar**

Este me lo encontré en un proyecto de trabajo. Cada vez que montabas un componente se añadía un listener. Cada vez que lo desmontabas, el listener se quedaba ahí. Después de navegar un rato, tenías decenas acumulados.

```typescript
// ❌ MAL — acumulas listeners cada vez que se monta el componente
class DataTable {
  constructor(private container: HTMLElement) {
    window.addEventListener('resize', this.handleResize)
  }
  private handleResize = () => { /* ... */ }
}

// ✅ BIEN — siempre con su cleanup
class DataTable {
  constructor(private container: HTMLElement) {
    window.addEventListener('resize', this.handleResize)
  }
  private handleResize = () => { /* ... */ }

  destroy() {
    window.removeEventListener('resize', this.handleResize)
  }
}
```

La trampa más común: usar arrow functions inline en el `addEventListener`. No puedes referenciarlas después para el `removeEventListener`. Siempre guarda la referencia.

---

### **3. `setInterval` olvidados**

`setInterval` es el más traicionero. Sigues ejecutándose aunque el componente que lo creó ya no exista — y mantiene vivo todo lo que referencia, incluyendo referencias al DOM que ya no está.

```typescript
// ❌ MAL — se llama varias veces y acumulas intervalos duplicados
function iniciarPolling(url: string) {
  setInterval(async () => {
    const data = await fetch(url)
    actualizarUI(data) // referencia a un DOM que puede no existir ya
  }, 5000)
}

// ✅ BIEN — siempre devuelve el cleanup
function iniciarPolling(url: string): () => void {
  const intervalId = setInterval(async () => {
    const data = await fetch(url)
    actualizarUI(data)
  }, 5000)
  return () => clearInterval(intervalId)
}

// En React:
useEffect(() => {
  const cleanup = iniciarPolling('/api/data')
  return cleanup // se ejecuta al desmontar
}, [])
```

---

### **4. Nodos DOM con referencias vivas**

Eliminas el elemento del DOM pero en algún Map o array de JavaScript sigues teniendo la referencia. El GC no lo puede limpiar — técnicamente sigue siendo accesible.

```typescript
// ❌ MAL — nodeCache retiene el nodo aunque ya no esté en el DOM
function eliminar(id: string) {
  const el = nodeCache.get(id)
  el?.remove() // fuera del DOM, pero nodeCache lo sigue teniendo
}

// ✅ BIEN — si lo quitas del DOM, quítalo también de JS
function eliminar(id: string) {
  const el = nodeCache.get(id)
  el?.remove()
  nodeCache.delete(id) // ahora sí el GC puede limpiarlo
}
```

Alternativa elegante: usar `WeakMap` en lugar de `Map`. Con `WeakMap` el GC puede reclamar los objetos aunque estén en el mapa — no cuenta como referencia fuerte.

---

### **5. Closures que retienen más de lo que deberían**

Los closures capturan el scope donde se crean. Si ese scope tiene un objeto grande y el closure vive mucho tiempo, ese objeto grande también vive mucho tiempo aunque no lo uses.

```typescript
// ❌ MAL — el closure captura datosGrandes entero aunque solo usa id
function crearHandler(datosGrandes: BigDataObject[]) {
  const id = datosGrandes[0].id
  return function handler() {
    console.log('Procesando:', id)
    // datosGrandes sigue en memoria por culpa del closure
  }
}

// ✅ BIEN — extrae solo lo que necesitas antes del closure
function crearHandler(datosGrandes: BigDataObject[]) {
  const id = datosGrandes[0].id
  // aquí datosGrandes ya puede ser recogido por el GC
  return function handler() {
    console.log('Procesando:', id)
  }
}
```

---

## **Cómo detectarlos con Chrome DevTools**

Cuando empecé a investigar los memory leaks, no sabía ni por dónde tirar. Chrome DevTools tiene dos herramientas que lo cambian todo.

**Heap Snapshot** — para comparar el antes y el después de una acción:

1. DevTools → Memory → Heap snapshot
2. Snapshot inicial
3. Ejecuta la acción sospechosa (navega, cierra un modal, desmonta un componente)
4. Fuerza el GC manualmente (botón 🗑️)
5. Segundo snapshot
6. Filtra por *"Objects allocated between snapshots"*

Si ves objetos que deberían haber desaparecido (componentes desmontados, listeners, nodos DOM), tienes el leak ahí. Mira la columna **Retainers** — te dice exactamente qué está manteniendo vivo ese objeto.

**Allocation Timeline** — para leaks continuos como un polling o un intervalo:

1. Memory → Allocation instrumentation on timeline
2. Graba 30-60 segundos de uso normal
3. Para la grabación

Si el heap sube sin parar y el baseline no baja aunque el GC se dispare, hay leak. Las barras azules son allocations que se mantienen vivas — haz clic en ellas para ver qué son.

---

## **Los fixes que más uso**

**useEffect con cleanup completo** — en React esto es innegociable para mí:

```typescript
useEffect(() => {
  const controller = new AbortController()

  fetch('/api/datos', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err)
    })

  window.addEventListener('resize', handleResize)
  const intervalId = setInterval(sincronizar, 10_000)

  return () => {
    controller.abort()
    window.removeEventListener('resize', handleResize)
    clearInterval(intervalId)
  }
}, [])
```

**WeakMap para cachés**:

```typescript
const cache = new WeakMap<object, ComputedResult>()

function getComputedResult(obj: object): ComputedResult {
  if (cache.has(obj)) return cache.get(obj)!
  const result = computeExpensive(obj)
  cache.set(obj, result) // si obj desaparece, esta entrada también
  return result
}
```

**`useMemo` para datos pesados** — el fix que me salvó con las gráficas de Recharts:

```typescript
// ❌ MAL — cada re-render procesa los 36.000 puntos desde cero
function GraficaIngesta({ datos, rangoInicio, rangoFin }: Props) {
  // Se ejecuta en cada render aunque datos no haya cambiado
  const datosFiltrados = datos.filter(
    d => d.timestamp >= rangoInicio && d.timestamp <= rangoFin
  )

  return <LineChart data={datosFiltrados}>...</LineChart>
}

// ✅ BIEN — solo recalcula cuando cambia el rango o los datos
function GraficaIngesta({ datos, rangoInicio, rangoFin }: Props) {
  const datosFiltrados = useMemo(
    () => datos.filter(
      d => d.timestamp >= rangoInicio && d.timestamp <= rangoFin
    ),
    [datos, rangoInicio, rangoFin] // dependencias exactas
  )

  return <LineChart data={datosFiltrados}>...</LineChart>
}
```

El `useMemo` evita que se creen objetos nuevos en cada render. El GC puede limpiar los anteriores porque ya no hay referencias vivas apuntando a ellos. Bajé de ~50MB a ~20MB por gráfica solo con esto.

**Observers siempre con disconnect**:

```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) cargarMas() }),
    { threshold: 0.1 }
  )

  const target = ref.current
  if (target) observer.observe(target)

  return () => {
    if (target) observer.unobserve(target)
    observer.disconnect()
  }
}, [])
```

---

## **TL;DR**

La mayoría de leaks son predecibles. No son bugs raros — son consecuencia de no pensar en el ciclo de vida completo de los recursos que creas.

- **Variables globales:** `const`/`let` siempre, `strict: true` en TS
- **Event listeners:** guarda la referencia, `removeEventListener` en cleanup
- **Intervalos:** guarda el ID, `clearInterval`/`clearTimeout` cuando ya no los necesites
- **DOM:** si borras el nodo, borra también su referencia en Maps/arrays
- **Closures:** extrae solo lo que necesitas del scope antes de crear el closure
- **Componentes pesados:** si generas PDFs, modales o vistas con mucho estado — asegúrate de que se desmontan de verdad y el estado se limpia. El GC no puede hacer su trabajo si el componente sigue montado
- **`useMemo` para datos pesados:** si estás procesando miles de puntos en cada render, `useMemo` con las dependencias correctas puede marcar la diferencia
- **React:** el `return` de `useEffect` es sagrado — úsalo siempre que haya recursos externos
- **Detección:** DevTools → Memory → Heap Snapshot o Allocation Timeline. Compara, busca en Retainers.

Crea el recurso, úsalo, líbralo. Siempre.

<img src="/posts/meme-memory-leak-honest-work.jpg" alt="It ain't much but it's honest work — el fix de limpiar el estado y desmontar bien el componente" style="max-width: 100%; border-radius: 8px; margin-top: 1rem;" />

---

Para cualquier duda déjame un comentario en [**LinkedIn**](https://www.linkedin.com/in/daniel-hernandez-puerto-57a093194/) o comparte si te ha resultado útil.

¡Hasta la próxima! 👋🏽
