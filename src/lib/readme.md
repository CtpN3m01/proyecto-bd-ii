
---

# 📁 Carpeta: `src/lib`

Esta carpeta contiene utilidades generales del backend de la aplicación. En este caso, proporciona la configuración para la conexión con la base de datos MariaDB, la cual es utilizada por todos los endpoints REST del backend.

---

## 📄 Archivo: `db.ts`

### ✅ Función principal

Establece y exporta un **pool de conexiones** con la base de datos MySQL/MariaDB usando `mysql2/promise`.

---

### 🔧 ¿Qué hace?

* Crea un pool reutilizable para ejecutar múltiples queries de manera eficiente.
* Utiliza variables de entorno para conectarse dinámicamente a la base de datos configurada en `.env.local`.
* Es usado por todos los archivos dentro de `src/pages/api/Database` para consultar MariaDB.

---

### 🧪 Variables de entorno necesarias

Este archivo espera encontrar las siguientes variables de entorno definidas:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=proyecto2BD
DB_NAME=wiki_analytics
```

---

### ⚙️ Configuración del pool

```ts
mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

* `waitForConnections`: espera si no hay conexiones disponibles.
* `connectionLimit`: máximo de conexiones simultáneas.
* `queueLimit`: 0 significa sin límite en la cola de espera.

---

### 🧩 Uso en el sistema

Este pool es importado como `pool` en todos los endpoints del backend, por ejemplo:

```ts
import { pool } from '@/lib/db';

const [rows] = await pool.query('SELECT * FROM pagina');
```

---
