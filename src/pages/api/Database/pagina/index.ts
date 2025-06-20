
import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows] = await pool.query('SELECT id, titulo FROM pagina ORDER BY titulo ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener páginas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
