"use client";

import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDarkMode = theme === "dark";

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="fixed flex items-center gap-2 w-[120px] p-5 bg-background border rounded-lg shadow-sm">
        <span className="text-sm">
            <Sun className="h-4 w-4" />
        </span>
        <Switch
            checked={isDarkMode}
            onCheckedChange={handleThemeChange}
        />
        <span className="text-sm">
            <Moon className="h-4 w-4" />
        </span>
    </div>
  );
}
