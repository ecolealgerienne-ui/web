"use client";

import { Moon, Sun, Beef, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { authConfig } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslations } from "@/lib/i18n";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const t = useTranslations('header.dashboard');

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
            <h1 className="text-xl font-semibold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {/* User Info */}
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-3 mr-2">
              <div className="text-right">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.farmName || user.email}</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Logout Button (only in prod mode) */}
          {authConfig.enabled && isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Déconnexion</span>
            </Button>
          )}

          {/* Dev Mode Indicator */}
          {!authConfig.enabled && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Mode DEV
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
