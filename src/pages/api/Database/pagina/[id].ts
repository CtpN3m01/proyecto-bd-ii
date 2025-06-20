import type { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

interface Pagina extends RowDataPacket {
  id: number;
  titulo: string;
  url: string;
  num_palabras: number;
  num_palabras_unicas: number;
  enlaces_salientes: number;
  enlaces_entrantes: number;
  edits_por_dia: number;
  pagerank: number;
  top_palabras: string;
  longitud_promedio: number;
}

interface PalabraFrecuencia extends RowDataPacket {
  palabra: string;
  frecuencia: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const [pagina] = await pool.query<Pagina[]>('SELECT * FROM pagina WHERE id = ?', [id]);
    const [topPalabras] = await pool.query<PalabraFrecuencia[]>(
      `SELECT palabra, frecuencia FROM palabra_pagina
       WHERE pagina_id = ?
       ORDER BY frecuencia DESC LIMIT 10`, [id]);

    if (!pagina.length) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    res.status(200).json({ pagina: pagina[0], top_palabras: topPalabras });
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar página' });
  }
}
