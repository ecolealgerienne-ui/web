/**
 * Utilitaires pour la gestion des noms multi-langues
 */

import { Breed } from '@/lib/types/breed';

type Locale = 'fr' | 'en' | 'ar';

/**
 * Obtient le nom d'une race dans la langue courante
 */
export function getBreedName(breed: Breed, locale: Locale): string {
  switch (locale) {
    case 'fr':
      return breed.nameFr || breed.name;
    case 'en':
      return breed.nameEn || breed.nameFr || breed.name;
    case 'ar':
      return breed.nameAr || breed.nameFr || breed.name;
    default:
      return breed.nameFr || breed.name;
  }
}

/**
 * Vérifie si une locale utilise RTL (Right-to-Left)
 */
export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}
