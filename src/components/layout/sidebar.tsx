"use client";

import { Home, Beef, Package, Syringe, Pill, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Beef, label: "Animaux", href: "/animals", active: false },
  { icon: Package, label: "Lots", href: "/lots", active: false },
  { icon: Syringe, label: "Vaccinations", href: "/vaccinations", active: false },
  { icon: Pill, label: "Traitements", href: "/treatments", active: false },
  { icon: BarChart3, label: "Rapports", href: "/reports", active: false },
  { icon: Settings, label: "Paramètres", href: "/settings", active: false },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 border-r bg-card h-screen sticky top-0 flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Beef className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">AniTra</span>
        </div>
      </div>
      <nav className="p-4 space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                item.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
