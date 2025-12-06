import { z } from 'zod'

/**
 * Schéma de validation pour créer/lier une Race-Pays
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés relatives)
 * ✅ RÈGLE Section 5.5 : Messages Zod avec clés relatives
 *
 * Pattern: Junction Table (Many-to-Many)
 * Tous les messages d'erreur sont des clés i18n relatives qui seront traduites
 * dans le composant via `t(error.message)` avec useTranslations('breedCountry')
 *
 * @example
 * ```typescript
 * const result = breedCountrySchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.breedId = ['validation.breedId.required']
 *   // Avec useTranslations('breedCountry'), t('validation.breedId.required') → breedCountry.validation.breedId.required
 * }
 * ```
 */
export const breedCountrySchema = z.object({
  /**
   * ID de la race (foreign key)
   * - Requis
   * - Format UUID
   */
  breedId: z
    .string()
    .min(1, 'validation.breedId.required')
    .uuid('validation.breedId.invalid'),

  /**
   * Code du pays ISO 3166-1 alpha-2
   * - Requis
   * - Exactement 2 caractères
   * - Format: majuscules (FR, DZ, TN, MA, etc.)
   */
  countryCode: z
    .string()
    .min(1, 'validation.countryCode.required')
    .length(2, 'validation.countryCode.length')
    .regex(/^[A-Z]{2}$/, 'validation.countryCode.pattern'),

  /**
   * Statut actif/inactif
   * - Optionnel (par défaut: true)
   */
  isActive: z.boolean().optional(),
})

/**
 * Schéma pour mettre à jour un lien Race-Pays
 * Utilisé principalement pour toggle isActive
 */
export const updateBreedCountrySchema = z.object({
  /**
   * Nouveau statut actif/inactif
   * - Requis pour update
   */
  isActive: z.boolean(),
})

/**
 * Type pour les formulaires de création/liaison
 * Utilisé avec react-hook-form
 */
export type BreedCountryFormData = z.infer<typeof breedCountrySchema>

/**
 * Type pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateBreedCountryFormData = z.infer<typeof updateBreedCountrySchema>
