import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { frase } = req.query;
  if (!frase || Array.isArray(frase)) return res.status(400).json({ error: 'Frase inválida' });

  try {
    const [rows] = await pool.query(
      `SELECT np.frecuencia, np.longitud, p.id, p.titulo, p.url
       FROM ngram_pagina np
       JOIN pagina p ON np.pagina_id = p.id
       WHERE np.frase = ?
       ORDER BY np.frecuencia DESC
       LIMIT 10`,
      [frase]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar ngrama por página' });
  }
}
