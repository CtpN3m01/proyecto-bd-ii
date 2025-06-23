# Aqui va los componentes


---

# 📁 Carpeta: `src/components`

Esta carpeta contiene los componentes visuales reutilizables que forman parte de la interfaz de usuario del proyecto *Wikipedia Análisis*. Cada componente encapsula una funcionalidad específica y se comunica con los hooks o props del sistema para renderizar la información obtenida desde MariaDB (ya procesada por Spark).

---

## 🧩 Componentes

---

### 📄 `Navbar.tsx`

* **¿Qué hace?**
  Componente de navegación principal con enlaces a las vistas del sistema.

* **Contenido:**
  Enlaces a `/dashboard`, `/distribucion`, `/ngrams`, y `/porcentaje`.

* **Uso:**
  Se coloca en la parte superior de la aplicación (`layout.tsx` o página principal).

---

### 📄 `Buscador.tsx`

* **¿Qué hace?**
  Componente de entrada de texto para buscar una palabra clave.

* **Propiedades:**

  * `onBuscar(query: string)`: función que se ejecuta al hacer clic en el botón de buscar.

* **Uso:**
  Componente central en `/dashboard`. Utiliza el hook `useBusqueda`.

---

### 📄 `ResultadoBusqueda.tsx`

* **¿Qué hace?**
  Componente que muestra los resultados de búsqueda devueltos por la API `/api/busqueda`.

* **Propiedades:**

  * `resultados`: lista de páginas que contienen la palabra clave buscada.
  * `onSelect(id: number)`: función que se ejecuta al hacer clic en un resultado.

* **Uso:**
  Se utiliza en `/dashboard` para mostrar resultados dinámicamente. Redirige al detalle de una página.

* **Análisis asociado:**
  Análisis 1: palabras más frecuentes por página.

---

### 📄 `DetallePagina.tsx`

* **¿Qué hace?**
  Componente que muestra la información completa de una página seleccionada, incluyendo:

  * Estadísticas generales (palabras, enlaces, edits, PageRank, etc.)
  * Top 10 palabras
  * Páginas similares por bigramas y trigramas
  * Grafo visual de relaciones

* **Hooks usados:**

  * `obtenerSimilaresBigramas`
  * `obtenerSimilaresTrigramas`

* **Gráfico:**
  Usa `react-force-graph-2d` para visualizar conexiones entre páginas.

* **Uso:**
  Se utiliza en la vista `/pagina/[id]`.

* **Análisis asociados:**

  * Análisis 4 y 5: coincidencias por bigramas/trigramas
  * Análisis 6, 7, 9 y 10: top palabras, enlaces, edits, PageRank

---
