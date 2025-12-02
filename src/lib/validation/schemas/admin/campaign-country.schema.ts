import { z } from 'zod'

/**
 * Schéma de validation pour créer/lier une Campagne-Pays
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés relatives)
 * ✅ RÈGLE Section 5.5 : Messages Zod avec clés relatives
 *
 * Pattern: Junction Table (Many-to-Many)
 * Tous les messages d'erreur sont des clés i18n relatives qui seront traduites
 * dans le composant via `t(error.message)` avec useTranslations('campaignCountry')
 *
 * @example
 * ```typescript
 * const result = campaignCountrySchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.campaignId = ['validation.campaignId.required']
 *   // Avec useTranslations('campaignCountry'), t('validation.campaignId.required') → campaignCountry.validation.campaignId.required
 * }
 * ```
 */
export const campaignCountrySchema = z.object({
  /**
   * ID de la campagne nationale (foreign key)
   * - Requis
   * - Format UUID
   */
  campaignId: z
    .string()
    .min(1, 'validation.campaignId.required')
    .uuid('validation.campaignId.invalid'),

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
 * Schéma pour mettre à jour un lien Campagne-Pays
 * Utilisé principalement pour toggle isActive
 */
export const updateCampaignCountrySchema = z.object({
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
export type CampaignCountryFormData = z.infer<typeof campaignCountrySchema>

/**
 * Type pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateCampaignCountryFormData = z.infer<typeof updateCampaignCountrySchema>
