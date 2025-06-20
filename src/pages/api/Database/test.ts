// Probar la conexión de la base
import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar a la base de datos', detalle: err });
  }
}
