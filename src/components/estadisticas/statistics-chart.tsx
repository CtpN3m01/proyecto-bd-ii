"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

interface PageResult {
  id: string;
  titulo: string;
  url: string;
  frecuencia: number;
}

interface StatisticsChartProps {
  selectedPage?: PageResult;
}

export default function StatisticsChart({ selectedPage }: StatisticsChartProps) {
  // Datos de ejemplo para los gráficos
  const barChartData = [
    { name: "Lun", value: 120 },
    { name: "Mar", value: 190 },
    { name: "Mié", value: 300 },
    { name: "Jue", value: 250 },
    { name: "Vie", value: 450 },
    { name: "Sáb", value: 200 },
    { name: "Dom", value: 180 }
  ];

  const pieChartData = [
    { name: "Documentación", value: 35, color: "#0088FE" },
    { name: "Tutoriales", value: 28, color: "#00C49F" },
    { name: "Blogs", value: 20, color: "#FFBB28" },
    { name: "Foros", value: 17, color: "#FF8042" }
  ];

  if (!selectedPage) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Estadísticas</h3>
              <p className="text-muted-foreground">
                Selecciona una página de los resultados para ver las estadísticas detalladas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extraer dominio de la URL
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Estadísticas</CardTitle>
        <CardDescription>
          Datos para "{selectedPage.titulo}" en {getDomain(selectedPage.url)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico de barras - Frecuencia por día */}
          <div>
            <h4 className="text-sm font-medium mb-3">Frecuencia por día de la semana</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--background))"
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico circular - Distribución por tipo de contenido */}
          <div>
            <h4 className="text-sm font-medium mb-3">Distribución por tipo de contenido</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  fontSize={10}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--background))"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{selectedPage.frecuencia.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Frecuencia total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{getDomain(selectedPage.url).split('.').length}</div>
              <div className="text-xs text-muted-foreground">Subdominios</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
