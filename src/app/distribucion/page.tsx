'use client';

import { useEffect, useState } from 'react';
import { obtenerDistribucionLongitud } from '@/hooks/useDistribucion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as BarTooltip,
  ResponsiveContainer as BarContainer,
  CartesianGrid,
  Legend as BarLegend,
} from 'recharts';
import {
  PieChart,
  Pie,
  Tooltip as PieTooltip,
  Cell,
  Legend,
  ResponsiveContainer as PieContainer,
} from 'recharts';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22d3ee',
  '#10b981', '#eab308', '#f43f5e', '#3b82f6', '#14b8a6',
];

export default function DistribucionPage() {
  const [data, setData] = useState([]);
  const [modo, setModo] = useState<'barras' | 'pastel'>('barras');

  useEffect(() => {
    obtenerDistribucionLongitud().then(setData).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-600 mb-2">
        Distribución de Longitudes de Palabras
      </h1>
      <p className="text-sm text-gray-300 mb-6">
        Este análisis muestra la cantidad de palabras según su longitud (número de caracteres) en el corpus de Wikipedia procesado.
      </p>

      {/* Botones para alternar modo */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            modo === 'barras'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          onClick={() => setModo('barras')}
        >
          Ver como Barras
        </button>
        <button
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            modo === 'pastel'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          onClick={() => setModo('pastel')}
        >
          Ver como Pastel
        </button>
      </div>

      {/* Gráfico de Barras */}
      {modo === 'barras' ? (
        <BarContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="longitud"
              label={{
                value: 'Longitud de Palabra',
                position: 'insideBottom',
                offset: -5,
                fill: '#ccc',
              }}
              tick={{ fill: '#ccc' }}
            />
            <YAxis
              label={{
                value: 'Frecuencia Total',
                angle: -90,
                position: 'insideLeft',
                fill: '#ccc',
              }}
              tick={{ fill: '#ccc' }}
            />
            <BarTooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#444', color: '#fff' }}
              formatter={(value: number) => [`${value} palabras`, 'Frecuencia']}
              labelFormatter={(label) => `Longitud: ${label} caracteres`}
            />
            <Bar dataKey="frecuencia_total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <BarLegend verticalAlign="top" height={36} wrapperStyle={{ color: '#ccc' }} />
          </BarChart>
        </BarContainer>
      ) : (
        // Gráfico de Pastel
        <PieContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              dataKey="frecuencia_total"
              nameKey="longitud"
              cx="50%"
              cy="50%"
              outerRadius={140}
              label={({ name, value }) => `L${name}: ${value}`}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <PieTooltip
              formatter={(value: number) => [`${value} palabras`, 'Frecuencia']}
              labelFormatter={(label) => `Longitud: ${label}`}
              contentStyle={{ backgroundColor: '#1f1f1f', color: '#fff', borderColor: '#444' }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#ccc' }} />
          </PieChart>
        </PieContainer>
      )}
    </div>
  );
}
