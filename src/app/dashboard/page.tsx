"use client";

import { useState } from "react";
import { 
  DashboardHeader, 
  SearchSection, 
  ResultsCarousel, 
  EmptyState,
  ThemeToggle
} from "@/components/dashboard";

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setIsLoading(true);
        try {
        // Aquí irá la lógica de búsqueda cuando la implementes
        console.log("Buscando:", searchQuery);
        
        // Datos de ejemplo para mostrar la estructura del carrusel
        setSearchResults([
            { id: 1, title: "Resultado 1", description: "Descripción del resultado 1" },
            { id: 2, title: "Resultado 2", description: "Descripción del resultado 2" },
            { id: 3, title: "Resultado 3", description: "Descripción del resultado 3" },
            { id: 4, title: "Resultado 4", description: "Descripción del resultado 4" },
            { id: 5, title: "Resultado 5", description: "Descripción del resultado 5" },
            { id: 6, title: "Resultado 6", description: "Descripción del resultado 6" },
            { id: 7, title: "Resultado 7", description: "Descripción del resultado 7" },
            { id: 8, title: "Resultado 8", description: "Descripción del resultado 8" },
            { id: 9, title: "Resultado 9", description: "Descripción del resultado 9" },
            { id: 10, title: "Resultado 10", description: "Descripción del resultado 10" },
            { id: 11, title: "Resultado 11", description: "Descripción del resultado 11" },
            { id: 12, title: "Resultado 12", description: "Descripción del resultado 12" },
            { id: 13, title: "Resultado 13", description: "Descripción del resultado 13" },
            { id: 14, title: "Resultado 14", description: "Descripción del resultado 14" },
            { id: 15, title: "Resultado 15", description: "Descripción del resultado 15" },
            { id: 16, title: "Resultado 16", description: "Descripción del resultado 16" },
            { id: 17, title: "Resultado 17", description: "Descripción del resultado 17" },
            { id: 18, title: "Resultado 18", description: "Descripción del resultado 18" },
            { id: 19, title: "Resultado 19", description: "Descripción del resultado 19" },
            { id: 20, title: "Resultado 20", description: "Descripción del resultado 20" },
        ]);
        } catch (error) {
        console.error("Error en la búsqueda:", error);
        } finally {
        setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
        handleSearch();
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
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

        <ResultsCarousel searchResults={searchResults} />

        <EmptyState isVisible={searchResults.length === 0 && !isLoading} />
        </div>
    );
}