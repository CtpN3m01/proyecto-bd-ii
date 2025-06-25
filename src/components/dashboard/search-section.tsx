"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface SearchSectionProps {
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function SearchSection({
  searchQuery,
  isLoading,
  onSearchChange,
  onSearch,
  onKeyPress
}: SearchSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Búsqueda</CardTitle>
        <CardDescription>
          Ingresa tu consulta para buscar información
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ingresa tu búsqueda..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={onKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={onSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="px-4"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Buscar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
