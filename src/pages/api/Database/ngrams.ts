import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows] = await pool.query(`
      SELECT frase, longitud, SUM(frecuencia) AS frecuencia
      FROM ngram
      GROUP BY frase, longitud
      ORDER BY frecuencia DESC
      LIMIT 100
    `);
    
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar ngramas' });
  }
}
