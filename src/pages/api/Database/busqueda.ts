import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Falta el parámetro "query"' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.titulo, p.url, pp.frecuencia
       FROM palabra_pagina pp
       JOIN pagina p ON pp.pagina_id = p.id
       WHERE pp.palabra = ?
       ORDER BY pp.frecuencia DESC`,
      [query]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar palabra' });
  }
}
