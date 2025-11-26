import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Les locales supportées
export const locales = ['fr', 'en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }: { locale: string }) => {
  // Valider que la locale est supportée
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale,
    messages: (await import(`./src/lib/i18n/messages/${locale}.json`)).default,
  };
});
