# Aqui va los endpoints


Claro, aquí tenés el contenido completo del `README` para la sección `src/pages/api/Database`, listo para copiar y pegar en tu repositorio:

---

# 📦 Sección: `src/pages/api/Database`

Esta carpeta contiene todos los **endpoints REST** desarrollados en Next.js (API Routes) para exponer los **datos ya analizados por Spark** y almacenados en **MariaDB**.
Cada archivo representa un análisis diferente y permite a la interfaz consultar y visualizar los resultados procesados.

⚠️ Todos los datos que estas APIs consultan han sido **previamente calculados** por Spark y almacenados mediante `.write.jdbc()`.

---

## ✳️ Endpoints Generales (no están en subcarpetas)

### `busqueda.ts`

* **Qué hace**: Permite buscar páginas por palabra clave.
* **Consulta**: `palabra_pagina` + `pagina`.
* **Análisis**: ① ¿Qué páginas tienen más copias de una palabra?
* **Uso en sistema**: Página `/dashboard` (Buscador principal).

### `ngrams.ts`

* **Qué hace**: Devuelve los 100 n-gramas (bigramas o trigramas) más frecuentes del corpus.
* **Consulta**: `ngram`.
* **Análisis**: ② y ③ N-gramas globales de 2 y 3 palabras.
* **Uso en sistema**: Página `/ngrams`.

### `distribucion-longitud.ts`

* **Qué hace**: Retorna la distribución global de longitudes de palabras.
* **Consulta**: `distribucion_longitud_palabra`.
* **Análisis**: Extra ② (longitudes globales).
* **Uso en sistema**: Página `/distribucion`.

---

## 📁 Subcarpeta: `pagina/`

### `[id].ts`

* **Qué hace**: Devuelve toda la información de una página por ID + sus 10 palabras más frecuentes.
* **Consulta**: `pagina`, `palabra_pagina`.
* **Análisis**:

  * ⑦ Cantidad de links
  * ⑨ Interconexión por PageRank
  * ⑩ Longitud promedio de palabra
  * ⑥ Top palabras
* **Uso en sistema**: Página `/pagina/[id]` (vista individual).

### `index.ts`

* **Qué hace**: Lista todos los títulos e IDs de las páginas.
* **Consulta**: `pagina`.
* **Uso en sistema**: `<select>` en `/porcentaje`.

---

## 📁 Subcarpeta: `porcentaje-palabras/`

### `[id].ts`

* **Qué hace**: Retorna el porcentaje de aparición de cada palabra en una página.
* **Consulta**: `porcentaje_palabra_pagina`.
* **Análisis**: ⑧ Porcentaje de cada palabra.
* **Uso en sistema**: Página `/porcentaje`.

---

## 📁 Subcarpeta: `similares-bigramas/`

### `[id].ts`

* **Qué hace**: Devuelve páginas con mayor coincidencia de bigramas respecto a la actual.
* **Consulta**: `coincidencia_bigramas`.
* **Análisis**: ④ Páginas similares por bigramas.
* **Uso en sistema**: Vista `/pagina/[id]`.

---

## 📁 Subcarpeta: `similares-trigramas/`

### `[id].ts`

* **Qué hace**: Devuelve páginas con mayor coincidencia de trigramas respecto a la actual.
* **Consulta**: `coincidencia_trigramas`.
* **Análisis**: ⑤ Páginas similares por trigramas.
* **Uso en sistema**: Vista `/pagina/[id]`.

---

## 📁 Subcarpeta: `ngrams/`

### `[frase].ts`

* **Qué hace**: Retorna las páginas donde aparece una frase específica (n-grama).
* **Consulta**: `ngram` + `pagina`.
* **Análisis**: ② + ③ Coincidencia por n-grama.
* **Uso en sistema**: Página `/ngrams/[frase]`.

---

## 📁 Subcarpeta: `ngramas-por-pagina/`

### `[frase].ts`

* **Qué hace**: Devuelve la frecuencia de un n-grama específico por cada página.
* **Consulta**: `ngram_pagina` + `pagina`.
* **Análisis**: Extensión del análisis ② + ③, con vista página por n-grama.
* **Uso en sistema**: Página `/ngrams/[frase]`.

---
