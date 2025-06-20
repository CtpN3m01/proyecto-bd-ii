
---

````markdown
# 📊 Proyecto Wikipedia Análisis — Frontend Next.js

Este proyecto corresponde a la **Parte 3** de la tarea programada: una aplicación web desarrollada en **Next.js** que permite visualizar los análisis hechos sobre páginas de Wikipedia, a partir de los datos almacenados en **MariaDB** previamente procesados por Spark.

---

## 🚀 Requisitos

Antes de ejecutar el proyecto, asegurate de tener instalado:

- [Node.js 18+](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/) o [Yarn](https://yarnpkg.com/)
- Acceso a la base de datos `wiki_analytics` (se proporciona por aparte)

---

## 🛠️ Instalación

1. **Cloná el repositorio:**

```bash
git clone https://github.com/CtpN3m01/proyecto-bd-ii.git 
cd proyecto-bd-ii
````

2. **Instalá las dependencias desde la misma carpeta raíz:**

```bash
npm install
```

3. **Configurá tu conexión local en `.env.local`:**

> ⚠️ Este archivo NO viene incluido. Debés crearlo manualmente en la carpeta (POYECTO-BD-II) raíz del proyecto.

```bash
touch .env.local
```

Y agregá lo siguiente:

```env
DB_HOST=xxx.xxx.xxx.xxx        # IP del servidor o localhost
DB_USER=usuario                 # Usuario de la base de datos
DB_PASS=contraseña              # Contraseña
DB_NAME=wiki_analytics
```

> 🔐 Estos valores son proporcionados aparte por el anfitrión del proyecto.

---

## ▶️ Cómo ejecutar el proyecto

Ejecutá en la misma carpeta raíz el servidor de desarrollo con:

```bash
npm run dev

```

Luego, abrí tu navegador en: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Qué se puede visualizar en el Frontend

La aplicación incluye varias páginas para explorar los análisis ya realizados con Spark:

| Página              | Ruta              | Qué muestra                                                   | Análisis                  |
| ------------------- | ----------------- | ------------------------------------------------------------- | ------------------------- |
| **Buscador**        | `/dashboard`      | Buscar palabra clave y ver estadísticas por página            | ①                         |
| **Distribución**    | `/distribucion`   | Gráfico de barras y pastel de longitudes de palabras globales | Extra ②                   |
| **N-gramas**        | `/ngrams`         | Frases más comunes (bigrama/trigrama)                         | ② y ③                     |
| **Detalle N-grama** | `/ngrams/[frase]` | Páginas donde aparece una frase (n-grama)                     | ②/③                       |
| **Porcentajes**     | `/porcentaje`     | Porcentaje de aparición de cada palabra por página            | ⑧                         |
| **Detalle Página**  | `/pagina/[id]`    | Estadísticas completas, palabras clave, similitudes, grafo    | ①, ④, ⑤, ⑥, ⑦, ⑨, Extra ① |

---

## 📁 Estructura clave del proyecto

```
src/
├── app/                   # Rutas y vistas principales (Next.js App Router)
├── components/            # Componentes reutilizables de UI
├── hooks/                 # Hooks para llamadas a APIs
├── lib/db.ts              # Conexión a MariaDB
└── pages/api/Database/    # Endpoints que consultan MariaDB
```

---

## ✅ Notas finales

* Los datos de la base `wiki_analytics` **ya están procesados** por Spark. No se recalculan aquí.
* Este frontend **solo consulta** y presenta resultados existentes desde MariaDB.
* El proyecto está optimizado para funcionar en **modo cliente** (`'use client'`) y es 100% compatible con **TailwindCSS**.

---

