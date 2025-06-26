"use client";

import { useState } from "react";
import NgramSearch from "./ngram-search";
import StatisticsChart from "./statistics-chart";

interface PageResult {
  id: string;
  titulo: string;
  url: string;
  frecuencia: number;
}

export default function GeneralStatistics() {
  const [selectedPage, setSelectedPage] = useState<PageResult>();

  const handlePageSelect = (page: PageResult) => {
    setSelectedPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Estadísticas Generales</h2>
        <p className="text-muted-foreground">
          Búsqueda inteligente de N-Grams con análisis automático
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Left Column - N-Gram Search */}
        <div className="lg:col-span-1">
          <NgramSearch 
            onPageSelect={handlePageSelect}
            selectedPage={selectedPage}
          />
        </div>

        {/* Right Column - Statistics Chart */}
        <div className="lg:col-span-1">
          <StatisticsChart 
            selectedPage={selectedPage}
          />
        </div>
      </div>
    </div>
  );
}
