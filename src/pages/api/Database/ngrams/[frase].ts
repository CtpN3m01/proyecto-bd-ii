import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const encoded = req.query.frase;
  const frase = decodeURIComponent(encoded as string);

  const [rows] = await pool.query(`
    SELECT n.pagina_id, p.titulo, n.frecuencia
    FROM ngram n
    JOIN pagina p ON n.pagina_id = p.id
    WHERE n.frase = ?
    ORDER BY n.frecuencia DESC
  `, [frase]);
  

  res.status(200).json(rows);
}
