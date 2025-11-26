/**
 * Configuration i18n pour next-intl
 *
 * Langues supportées:
 * - en: English (langue par défaut)
 * - fr: Français
 * - ar: العربية (Arabic)
 */

export const locales = ['fr', 'en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
};

// Configuration pour les langues RTL (Right-to-Left)
export const rtlLocales: Locale[] = ['ar'];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

// Détection de la locale depuis le navigateur ou le stockage local
export function getPreferredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  // 1. Vérifier le localStorage
  const stored = localStorage.getItem('locale') as Locale;
  if (stored && locales.includes(stored)) {
    return stored;
  }

  // 2. Détecter depuis le navigateur
  const browserLang = navigator.language.split('-')[0];
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  // 3. Par défaut
  return defaultLocale;
}

// Sauvegarder la préférence de langue
export function setPreferredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locale', locale);
}
