'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useState, useEffect } from 'react';
import { getPreferredLocale, isRTL, type Locale } from './config';

interface I18nProviderProps {
  children: ReactNode;
}

/**
 * Provider i18n pour l'application
 * Gère le chargement dynamique des messages et la locale courante
 */
export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>('fr');
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    // Charger la locale préférée au démarrage
    const preferredLocale = getPreferredLocale();
    setLocale(preferredLocale);

    // Appliquer la direction RTL si nécessaire
    const direction = isRTL(preferredLocale) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', preferredLocale);

    // Charger les messages
    import(`./messages/${preferredLocale}.json`)
      .then((module) => setMessages(module.default))
      .catch((error) => {
        console.error('Failed to load locale messages:', error);
        // Fallback sur FR
        import('./messages/fr.json').then((module) => setMessages(module.default));
      });
  }, []);

  // Afficher un chargement minimal pendant le chargement des messages
  if (!messages) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Hook pour changer de langue
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getPreferredLocale());

  const changeLocale = async (newLocale: Locale) => {
    try {
      // Charger les nouveaux messages
      const messages = await import(`./messages/${newLocale}.json`);

      // Sauvegarder la préférence
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale);
      }

      // Appliquer la direction RTL
      const direction = isRTL(newLocale) ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', direction);
      document.documentElement.setAttribute('lang', newLocale);

      setLocaleState(newLocale);

      // Recharger la page pour appliquer la nouvelle locale
      window.location.reload();
    } catch (error) {
      console.error('Failed to change locale:', error);
    }
  };

  return { locale, changeLocale };
}
