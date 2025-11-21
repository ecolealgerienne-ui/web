"use client";

import { Moon, Sun, Beef } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Beef className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AniTra</span>
          </div>
          {/* Desktop Title */}
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Vue d&apos;ensemble</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-sm font-medium">FR</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
