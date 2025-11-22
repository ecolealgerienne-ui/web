'use client';

import { useLocale, localeNames, type Locale } from '@/lib/i18n';
import { Select } from '@/components/ui/select';
import { Globe } from 'lucide-react';

/**
 * Composant pour changer la langue de l'application
 * Affiche un sélecteur avec FR, EN, AR
 */
export function LanguageSwitcher() {
  const { locale, changeLocale } = useLocale();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value as Locale;
    changeLocale(newLocale);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={locale}
        onChange={handleChange}
        className="w-[120px]"
      >
        {Object.entries(localeNames).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </Select>
    </div>
  );
}
