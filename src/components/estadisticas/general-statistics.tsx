"use client";

import { useState } from "react";
import NgramsTable from "./ngrams-table";
import Top10Pages from "./top10-pages";
import StatisticsChart from "./statistics-chart";

interface NGramData {
  id: string;
  ngram: string;
  frequency: number;
  pages: number;
}

interface PageData {
  id: string;
  url: string;
  title: string;
  copies: number;
  domain: string;
}

export default function GeneralStatistics() {
  const [selectedNgram, setSelectedNgram] = useState<NGramData>();
  const [selectedPage, setSelectedPage] = useState<PageData>();

  const handleNgramSelect = (ngram: NGramData) => {
    setSelectedNgram(ngram);
    setSelectedPage(undefined); // Reset page selection when ngram changes
  };

  const handlePageSelect = (page: PageData) => {
    setSelectedPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Estadísticas Generales</h2>
        <p className="text-muted-foreground">
          Análisis detallado de N-Grams y distribución de contenido
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Left Column - N-Grams Table */}
        <div className="lg:col-span-1">
          <NgramsTable 
            onNgramSelect={handleNgramSelect}
            selectedNgram={selectedNgram}
          />
        </div>

        {/* Middle Column - Top 10 Pages */}
        <div className="lg:col-span-1">
          <Top10Pages 
            selectedNgram={selectedNgram}
            onPageSelect={handlePageSelect}
            selectedPage={selectedPage}
          />
        </div>

        {/* Right Column - Statistics Chart */}
        <div className="lg:col-span-1">
          <StatisticsChart 
            selectedNgram={selectedNgram}
            selectedPage={selectedPage}
          />
        </div>
      </div>
    </div>
  );
}
