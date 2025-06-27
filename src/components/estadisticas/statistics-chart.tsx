"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";
import { useDistribucion } from "@/hooks/useDistribucion";

export default function StatisticsChart() {
  const { data, isLoading, error, refetch } = useDistribucion();

  // Estado de carga
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Distribución de Longitud de Palabras</CardTitle>
          <CardDescription>
            Frecuencia total por longitud de palabra en el corpus
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Distribución de Longitud de Palabras</CardTitle>
          <CardDescription>
            Frecuencia total por longitud de palabra en el corpus
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Error al cargar datos</h3>
              <p className="text-muted-foreground text-sm">{error}</p>
              <button 
                onClick={refetch}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
              >
                Reintentar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado sin datos
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Distribución de Longitud de Palabras</CardTitle>
          <CardDescription>
            Frecuencia total por longitud de palabra en el corpus
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Sin datos disponibles</h3>
              <p className="text-muted-foreground">
                No hay información de distribución de longitud de palabras
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.map(item => ({
    longitud: item.longitud,
    frecuencia: item.frecuencia_total,
    // Formatear para el tooltip
    label: `${item.longitud} ${item.longitud === 1 ? 'carácter' : 'caracteres'}`
  }));

  // Calcular estadísticas
  const totalPalabras = data.reduce((sum, item) => sum + item.frecuencia_total, 0);
  const longitudPromedio = data.reduce((sum, item) => sum + (item.longitud * item.frecuencia_total), 0) / totalPalabras;
  const longitudMasFrecuente = data.reduce((max, item) => 
    item.frecuencia_total > max.frecuencia_total ? item : max
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Distribución de Longitud de Palabras</CardTitle>
        <CardDescription>
          Frecuencia total por longitud de palabra en el corpus
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico de barras */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="longitud"
                  fontSize={15}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Longitud (caracteres)', position: 'insideBottom', offset: -15 }}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft', offset: -15 }}
                />
                <Tooltip 
                  contentStyle={{
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid",
                    backgroundColor: "#1e293b",
                    fontWeight: 'bold',
                  }}
                  formatter={(value: number, name: string) => [
                    <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{value.toLocaleString()} Frecuencia</span>,
                  ]}
                  labelFormatter={(label: number) => `${label} ${label === 1 ? 'carácter' : 'caracteres'}`}
                />
                <Bar 
                  dataKey="frecuencia" 
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Estadísticas resumidas */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalPalabras.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total palabras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{longitudPromedio.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Longitud promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{longitudMasFrecuente.longitud}</div>
              <div className="text-xs text-muted-foreground">Más frecuente</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
