'use client';

import { useLocale, type Locale } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'fr' as Locale, label: 'Français', flag: '🇫🇷' },
  { code: 'en' as Locale, label: 'English', flag: '🇬🇧' },
  { code: 'ar' as Locale, label: 'العربية', flag: '🇩🇿' },
];

export function LanguageSwitcher() {
  const { locale, changeLocale } = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    changeLocale(newLocale as Locale);
  };

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[120px] h-9">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>
            <span>{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
