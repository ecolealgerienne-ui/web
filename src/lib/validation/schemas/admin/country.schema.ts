import { z } from 'zod'

/**
 * Schéma de validation pour création/édition de pays
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés, pas de texte)
 *
 * Tous les messages d'erreur sont des clés i18n qui seront traduites
 * dans le composant via `t(error.message)`
 *
 * @example
 * ```typescript
 * const result = countrySchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.code = ['country.validation.code.required']
 * }
 * ```
 */
export const countrySchema = z.object({
  /**
   * Code unique du pays
   * - Requis
   * - Max 50 caractères
   * - Format : majuscules, chiffres, tirets, underscores
   */
  code: z.string()
    .min(1, 'country.validation.code.required')
    .max(50, 'country.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'country.validation.code.pattern'
    ),

  /**
   * Nom du pays en français
   * - Requis
   * - Max 200 caractères
   */
  nameFr: z.string()
    .min(1, 'country.validation.nameFr.required')
    .max(200, 'country.validation.nameFr.maxLength'),

  /**
   * Nom du pays en anglais
   * - Requis
   * - Max 200 caractères
   */
  nameEn: z.string()
    .min(1, 'country.validation.nameEn.required')
    .max(200, 'country.validation.nameEn.maxLength'),

  /**
   * Nom du pays en arabe
   * - Requis
   * - Max 200 caractères
   */
  nameAr: z.string()
    .min(1, 'country.validation.nameAr.required')
    .max(200, 'country.validation.nameAr.maxLength'),

  /**
   * Code ISO 3166-1 alpha-2 (2 lettres)
   * - Requis
   * - Exactement 2 caractères majuscules
   */
  isoCode2: z.string()
    .min(1, 'country.validation.isoCode2.required')
    .length(2, 'country.validation.isoCode2.length')
    .regex(
      /^[A-Z]{2}$/,
      'country.validation.isoCode2.pattern'
    ),

  /**
   * Code ISO 3166-1 alpha-3 (3 lettres)
   * - Requis
   * - Exactement 3 caractères majuscules
   */
  isoCode3: z.string()
    .min(1, 'country.validation.isoCode3.required')
    .length(3, 'country.validation.isoCode3.length')
    .regex(
      /^[A-Z]{3}$/,
      'country.validation.isoCode3.pattern'
    ),

  /**
   * Statut actif/inactif (optionnel)
   */
  isActive: z.boolean().optional(),
})

/**
 * Schéma pour mise à jour
 * Ajoute le champ `version` obligatoire pour optimistic locking
 */
export const updateCountrySchema = countrySchema.extend({
  /**
   * Version pour optimistic locking
   * Doit être un entier positif
   */
  version: z.number()
    .int('country.validation.version.integer')
    .positive('country.validation.version.positive'),
})

/**
 * Type inféré pour les formulaires de création
 * Utilisé avec react-hook-form
 */
export type CountryFormData = z.infer<typeof countrySchema>

/**
 * Type inféré pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateCountryFormData = z.infer<typeof updateCountrySchema>
