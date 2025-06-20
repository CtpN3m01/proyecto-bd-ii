
---

# 📁 Carpeta: `src/app`

Esta carpeta contiene **todas las páginas del frontend** de la aplicación Wikipedia Análisis desarrollada con **Next.js**. Es la interfaz principal que permite visualizar los resultados generados por Apache Spark y almacenados en MariaDB.

Todas las páginas consumen datos precalculados a través de los endpoints ubicados en `src/pages/api/Database`, usando hooks definidos en `src/hooks`, y componentes reutilizables en `src/components`.

---

## ✳️ Archivos principales

### `layout.tsx`

* **Qué hace**: Define el layout base global de la aplicación (incluye `<Navbar />` en todas las páginas).
* **Componentes usados**: `Navbar.tsx`.
* **Importancia**: Aplica estilos globales y navegación principal.

---

### `page.tsx`

* **Qué hace**: Redirige automáticamente a la ruta `/dashboard` al cargar la raíz (`/`).
* **Uso**: Página de inicio vacía que actúa como redirector.

---

### `globals.css`

* **Qué hace**: Define estilos globales con soporte para modo claro/oscuro y configuración de fuente y colores base.
* **Frameworks usados**: TailwindCSS.

---

## 🧠 Subcarpetas con páginas funcionales

---

### 📁 `/dashboard/page.tsx`

* **Qué hace**: Vista principal con buscador por palabra clave.
* **Análisis que muestra**:

  * ✅ **Análisis 1:** ¿Qué páginas tienen más copias de una palabra?
* **Hooks usados**: `useBusqueda()`.
* **APIs consultadas**: `/api/busqueda` (`src/app/api/busqueda/route.ts`).
* **Componentes usados**:

  * Internamente muestra tarjetas con estadísticas por página.
* **Tablas consultadas**:

  * `palabra_pagina`, `pagina`.

---

### 📁 `/distribucion/page.tsx`

* **Qué hace**: Muestra la distribución de longitudes de palabras como gráfico de barras o pastel.
* **Análisis que muestra**:

  * ✅ **Análisis Extra 2:** Distribución global de longitud de palabras.
* **Hook usado**: `obtenerDistribucionLongitud()`.
* **API**: `/api/Database/distribucion-longitud`.
* **Datos**: Tabla `distribucion_longitud_palabra`.

---

### 📁 `/ngrams/page.tsx`

* **Qué hace**: Lista los 100 n-gramas más frecuentes (frases de 2 o 3 palabras).
* **Análisis**:

  * ✅ **Análisis 2:** Bigrams más frecuentes.
  * ✅ **Análisis 3:** Trigrams más frecuentes.
* **Hook usado**: `obtenerNgramas()`.
* **API**: `/api/Database/ngrams`.
* **Datos**: Tabla `ngram`.

---

### 📁 `/ngrams/[frase]/page.tsx`

* **Qué hace**: Muestra las páginas donde aparece un n-grama específico.
* **Análisis**:

  * ✅ Complemento de los análisis 2 y 3 (pero por frase específica).
* **Hook usado**: `obtenerPaginasPorNgrama()`.
* **API**: `/api/Database/ngrams/[frase]`.
* **Datos**: Tabla `ngram`.

---

### 📁 `/pagina/[id]/page.tsx`

* **Qué hace**: Vista de detalle para una página de Wikipedia.
* **Análisis que muestra**:

  * ✅ **Análisis 6:** Top palabras por página.
  * ✅ **Análisis 4 y 5:** Páginas con bigramas/trigramas coincidentes.
  * ✅ **Análisis 7:** Cantidad de links.
  * ✅ **Análisis 9:** Interconexión por enlaces (PageRank).
  * ✅ **Análisis Extra 1:** Longitud promedio de palabras.
* **Hooks usados**:

  * `obtenerDetallePagina()`, `obtenerSimilaresBigramas()`, `obtenerSimilaresTrigramas()`.
* **API**:

  * `/api/Database/pagina/[id]`, `/similares-bigramas/[id]`, `/similares-trigramas/[id]`.
* **Componentes**: `DetallePagina.tsx` (incluye grafo con `ForceGraph2D`).
* **Tablas**: `pagina`, `palabra_pagina`, `coincidencia_bigramas`, `coincidencia_trigramas`.

---

### 📁 `/porcentaje/page.tsx`

* **Qué hace**: Permite seleccionar una página y ver el porcentaje que representa cada palabra sobre el total.
* **Análisis que muestra**:

  * ✅ **Análisis 8:** Porcentaje de cada palabra en su página.
* **API**:

  * `/api/Database/porcentaje-palabras/[id]`, `/api/Database/pagina`.
* **Datos**: Tabla `porcentaje_palabra_pagina`, `pagina`.

---

### 📁 `/api/busqueda/route.ts`

* **Qué hace**: API moderna (`app router`) para `/dashboard`, alternativa a `/pages/api/busqueda.ts`.
* **Tablas**: `palabra_pagina`, `pagina`.

---

