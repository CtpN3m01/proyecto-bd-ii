import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const [rows] = await pool.query(
      `SELECT cb.pagina_id_coincidente, p.titulo, cb.cantidad_bigramas_comunes
       FROM coincidencia_bigramas cb
       JOIN pagina p ON cb.pagina_id_coincidente = p.id
       WHERE cb.pagina_id_base = ?
       ORDER BY cb.cantidad_bigramas_comunes DESC
       LIMIT 5`, [id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar bigramas' });
  }
}
