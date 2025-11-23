"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Beef, Package, Syringe, Pill, BarChart3, Settings, Database, Calendar, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { canAccessAdmin } from "@/lib/utils/permissions";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Beef, label: "Animaux", href: "/animals" },
  { icon: Calendar, label: "Événements", href: "/animal-events" },
  { icon: Package, label: "Lots", href: "/lots" },
  { icon: Syringe, label: "Vaccinations", href: "/vaccinations" },
  { icon: Pill, label: "Traitements", href: "/treatments" },
  { icon: Scale, label: "Pesées", href: "/weighings" },
];

// Menu Données de référence (super admin uniquement)
const dataMenuItems = [
  { label: "Races", href: "/data/breeds" },
  { label: "Vaccins", href: "/data/vaccines" },
  { label: "Maladies", href: "/data/diseases" },
  { label: "Médicaments", href: "/data/medications" },
  { label: "Vétérinaires", href: "/data/veterinarians" },
  { label: "Campagnes", href: "/data/campaigns" },
  { label: "Préférences", href: "/data/farm-preferences" },
  { label: "Alertes", href: "/data/alert-configurations" },
  { label: "Fermes", href: "/data/farms" },
];

const bottomMenuItems = [
  { icon: BarChart3, label: "Rapports", href: "/reports" },
  { icon: Settings, label: "Paramètres", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="hidden md:flex w-64 border-r bg-card h-screen sticky top-0 flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Beef className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">AniTra</span>
        </Link>
      </div>
      <nav className="p-4 space-y-1 flex-1">
        {/* Menu principal */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Séparateur pour Données */}
        {canAccessAdmin(user) && (
          <>
            <div className="my-4 border-t border-border" />

            {/* Menu Données de référence (super admin uniquement) */}
            <div className="mb-1">
              <div className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                <Database className="h-4 w-4" />
                Données
              </div>
              <div className="ml-7 space-y-1">
                {dataMenuItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Séparateur avant menu du bas */}
        <div className="my-4 border-t border-border" />

        {/* Menu du bas (Rapports, Paramètres) */}
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
