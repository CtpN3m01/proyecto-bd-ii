import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface PalabraPorcentaje {
  palabra: string;
  frecuencia: number;
  porcentaje: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { pagina_id } = req.query;

    if (!pagina_id || typeof pagina_id !== 'string') {
      return res.status(400).json({ 
        error: 'El parámetro "pagina_id" es requerido' 
      });
    }

    const paginaIdNum = parseInt(pagina_id);
    
    const results = await query<PalabraPorcentaje>(
      `SELECT DISTINCT pp.palabra, pp.frecuencia, prpp.porcentaje
       FROM palabra_pagina AS pp 
       INNER JOIN porcentaje_palabra_pagina AS prpp USING(palabra, pagina_id) 
       WHERE pp.pagina_id = ? 
       ORDER BY pp.frecuencia DESC, pp.palabra ASC`,
      [paginaIdNum]
    );

    return res.status(200).json({
      success: true,
      data: results,
      total: results.length,
      pagina_id: paginaIdNum
    });

  } catch (error) {
    console.error('❌ Error en API de palabras-porcentajes:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
