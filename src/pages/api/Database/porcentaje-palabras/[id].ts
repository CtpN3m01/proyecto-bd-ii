import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const [rows] = await pool.query(
      `SELECT palabra, porcentaje
       FROM porcentaje_palabra_pagina
       WHERE pagina_id = ?
       ORDER BY porcentaje DESC
       LIMIT 20`, [id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar porcentajes' });
  }
}
