# Aqui va los archivos que tienen funciones que llaman a los endpoints para poder usar esas funciones solo importandolas y llamandolas desde el frontend y solo usar parametros.


---

# 📁 Carpeta: `src/hooks`

Esta carpeta contiene funciones personalizadas de React (custom hooks) y funciones utilitarias para acceder a los endpoints del backend. Estos hooks encapsulan las llamadas a la API REST de la carpeta `src/pages/api/Database` y permiten reutilizar lógica de consulta en los componentes del frontend.

---

## 🔌 Hooks disponibles

### 📄 `useBusqueda.ts`

* **¿Qué hace?**
  Hook personalizado que permite buscar páginas por palabra clave y manejar el estado de carga, error y resultados.

* **Consulta:**
  Endpoint: `/api/busqueda`
  Tabla: `palabra_pagina` + `pagina`

* **Análisis relacionado:**
  Análisis 1 – Búsqueda por palabra y ranking por frecuencia.

* **Uso en el sistema:**
  Vista `/dashboard` (Buscador principal).

---

### 📄 `useDetallePagina.ts`

* **¿Qué hace?**
  Función que obtiene el detalle completo de una página por su ID, incluyendo estadísticas y top palabras.

* **Consulta:**
  Endpoint: `/api/Database/pagina/[id]`
  Tablas: `pagina`, `palabra_pagina`

* **Análisis relacionado:**
  Análisis 6, 7, 9, 10

* **Uso en el sistema:**
  Vista `/pagina/[id]` (Detalle individual con gráficas y métricas).

---

### 📄 `useDistribucion.ts`

* **¿Qué hace?**
  Función que obtiene la distribución global de longitudes de palabras.

* **Consulta:**
  Endpoint: `/api/Database/distribucion-longitud`
  Tabla: `distribucion_longitud_palabra`

* **Análisis relacionado:**
  Análisis Extra 2

* **Uso en el sistema:**
  Página `/distribucion` (Gráfico de barras o pastel).

---

### 📄 `useNgramas.ts`

* **¿Qué hace?**
  Función que obtiene los n-gramas (2 y 3 palabras) más frecuentes.

* **Consulta:**
  Endpoint: `/api/Database/ngrams`
  Tabla: `ngram`

* **Análisis relacionado:**
  Análisis 2 y 3 (más frecuentes globales)

* **Uso en el sistema:**
  Página `/ngrams` (Lista de frases más comunes).

---

### 📄 `usePaginasPorNgrama.ts`

* **¿Qué hace?**
  Función que obtiene las páginas que contienen un n-grama específico.

* **Consulta:**
  Endpoint: `/api/Database/ngrams/[frase]`
  Tabla: `ngram` + `pagina`

* **Análisis relacionado:**
  Extensión de Análisis 2 y 3

* **Uso en el sistema:**
  Página `/ngrams/[frase]`

---

### 📄 `useSimilaresBigramas.ts`

* **¿Qué hace?**
  Función que retorna las páginas similares por coincidencia de bigramas.

* **Consulta:**
  Endpoint: `/api/Database/similares-bigramas/[id]`
  Tabla: `coincidencia_bigramas`

* **Análisis relacionado:**
  Análisis 4

* **Uso en el sistema:**
  Vista de detalle de página (`/pagina/[id]`)

---

### 📄 `useSimilaresTrigramas.ts`

* **¿Qué hace?**
  Función que retorna las páginas similares por coincidencia de trigramas.

* **Consulta:**
  Endpoint: `/api/Database/similares-trigramas/[id]`
  Tabla: `coincidencia_trigramas`

* **Análisis relacionado:**
  Análisis 5

* **Uso en el sistema:**
  Vista de detalle de página (`/pagina/[id]`)

---
