/**
 * Fonction pour récupérer les messages de traduction
 * Utilisée par next-intl pour charger les traductions côté serveur et client
 */

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Valider que la locale est supportée
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
