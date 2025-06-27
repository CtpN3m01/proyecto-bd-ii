"use client";

import { useState } from "react";
import { 
  DashboardHeader, 
  SearchSection, 
  ResultsCarousel, 
  EmptyState,
  ThemeToggle
} from "@/components/dashboard";
import { GeneralStatistics } from "@/components/estadisticas";
import { useBusquedaPaginas } from "@/hooks/useBusquedaPaginas";

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const { 
        resultados, 
        isLoading, 
        error, 
        buscarPaginas, 
        clearResultados 
    } = useBusquedaPaginas();

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            clearResultados();
            return;
        }
        
        await buscarPaginas(searchQuery);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        // Limpiar resultados si el campo se vacía
        if (!value.trim()) {
            clearResultados();
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <DashboardHeader />
                </div>
                <ThemeToggle />
            </div>
            
            <SearchSection
                searchQuery={searchQuery}
                isLoading={isLoading}
                onSearchChange={handleSearchChange}
                onSearch={handleSearch}
                onKeyPress={handleKeyPress}
            />

            {/* Mostrar error si existe */}
            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    <h3 className="font-semibold">Error en la búsqueda</h3>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <ResultsCarousel searchResults={resultados} />

            <EmptyState isVisible={resultados.length === 0 && !isLoading && !error && !searchQuery.trim()} />

            <GeneralStatistics />
        </div>
    );
}