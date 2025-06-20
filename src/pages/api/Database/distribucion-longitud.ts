import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM distribucion_longitud_palabra ORDER BY longitud ASC`
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar distribución' });
  }
}
