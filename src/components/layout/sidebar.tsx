"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Beef, Package, Pill, BarChart3, Settings, Calendar, Scale, Shield, PackageOpen, Ruler, Bird, Globe, Stethoscope, Megaphone, Bell, Building2, CalendarClock, Dog, Boxes, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { canAccessAdmin } from "@/lib/utils/permissions";
import { useTranslations } from "@/lib/i18n";

const menuItems = [
  { icon: Home, key: "dashboard", href: "/dashboard" },
  { icon: Beef, key: "animals", href: "/animals" },
  { icon: Calendar, key: "events", href: "/animal-events" },
  { icon: Package, key: "lots", href: "/lots" },
  { icon: Pill, key: "treatments", href: "/treatments" },
  { icon: Scale, key: "weighings", href: "/weighings" },
  { icon: Boxes, key: "pharmacy", href: "/pharmacy" },
];

// Menu Données de référence (référentiels globaux - super admin uniquement)
const adminMenuItems = [
  { icon: Ruler, key: "units", href: "/admin/units" },
  { icon: Bird, key: "species", href: "/admin/species" },
  { icon: Dog, key: "breeds", href: "/admin/breeds" },
  { icon: CalendarClock, key: "ageCategories", href: "/admin/age-categories" },
  { icon: Globe, key: "countries", href: "/admin/countries" },
  { icon: Stethoscope, key: "veterinarians", href: "/admin/veterinarians" },
  { icon: Megaphone, key: "nationalCampaigns", href: "/admin/national-campaigns" },
  { icon: Bell, key: "alertTemplates", href: "/admin/alert-templates" },
  { icon: PackageOpen, key: "products", href: "/admin/products" },
  { icon: Link2, key: "breedCountries", href: "/admin/breed-countries" },
  { icon: Link2, key: "campaignCountries", href: "/admin/campaign-countries" },
];

const bottomMenuItems = [
  { icon: Building2, key: "farms", href: "/data/farms" },
  { icon: BarChart3, key: "reports", href: "/reports" },
  { icon: Settings, key: "settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations('navigation');

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="hidden md:flex w-64 border-r bg-card h-screen sticky top-0 flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
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
              {t(`menu.${item.key}`)}
            </Link>
          );
        })}

        {/* Séparateur pour Admin */}
        {canAccessAdmin(user) && (
          <>
            <div className="my-4 border-t border-border" />

            {/* Menu Données de référence (référentiels globaux) */}
            <div className="mb-1">
              <div className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-foreground">
                <Shield className="h-4 w-4" />
                {t('admin.title')}
              </div>
              <div className="ml-3 space-y-1">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t(`admin.${item.key}`)}
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
              {t(`menu.${item.key}`)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
