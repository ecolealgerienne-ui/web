/**
 * Hooks i18n personnalisés pour simplifier l'utilisation des traductions
 */

import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * Hook pour accéder aux traductions
 *
 * Usage:
 * const t = useTranslations('breeds');
 * t('title') // => "Races"
 * t('messages.created') // => "Race créée avec succès"
 */
export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

/**
 * Hook pour les traductions communes (common)
 */
export function useCommonTranslations() {
  return useNextIntlTranslations('common');
}

/**
 * Hook pour les messages d'erreur
 */
export function useErrorTranslations() {
  return useNextIntlTranslations('errors');
}

/**
 * Hook pour la navigation
 */
export function useNavigationTranslations() {
  return useNextIntlTranslations('navigation');
}
