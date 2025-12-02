import { z } from 'zod'

/**
 * Schéma de validation pour création/édition d'un conditionnement de produit
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés relatives, pas de texte)
 * ✅ RÈGLE Section 5.3 : z.number() pour displayOrder (pas de z.coerce)
 * ✅ RÈGLE Section 5.5 : Messages avec clés RELATIVES (sans préfixe entité)
 *
 * Tous les messages d'erreur sont des clés i18n relatives qui seront traduites
 * dans le composant via `t(error.message)` avec useTranslations('productPackaging')
 *
 * @example
 * ```typescript
 * const result = productPackagingSchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.productId = ['validation.productId.required']
 *   // Avec useTranslations('productPackaging'), t('validation.productId.required')
 *   // → productPackaging.validation.productId.required
 * }
 * ```
 */
export const productPackagingSchema = z.object({
  /**
   * ID du produit (foreign key)
   * - Requis
   * - Format UUID
   */
  productId: z.string()
    .min(1, 'validation.productId.required')
    .uuid('validation.productId.invalid'),

  /**
   * Label du conditionnement
   * - Requis
   * - Max 200 caractères
   */
  packagingLabel: z.string()
    .min(1, 'validation.packagingLabel.required')
    .max(200, 'validation.packagingLabel.maxLength'),

  /**
   * Code pays ISO
   * - Requis
   * - Format: 2 caractères majuscules (ex: DZ, FR, MA)
   */
  countryCode: z.string()
    .min(1, 'validation.countryCode.required')
    .length(2, 'validation.countryCode.length')
    .regex(/^[A-Z]{2}$/, 'validation.countryCode.pattern'),

  /**
   * Code GTIN/EAN (optionnel)
   * - Max 50 caractères
   * - Contient chiffres principalement
   */
  gtinEan: z.string()
    .max(50, 'validation.gtinEan.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Numéro d'Autorisation de Mise sur le Marché (optionnel)
   * - Max 100 caractères
   */
  numeroAMM: z.string()
    .max(100, 'validation.numeroAMM.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Concentration (optionnel)
   * - Max 100 caractères
   * - Ex: "500mg/ml", "10%", "1:1000"
   */
  concentration: z.string()
    .max(100, 'validation.concentration.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * ID de l'unité de mesure (optionnel)
   * - Format UUID si fourni
   */
  unitId: z.string()
    .uuid('validation.unitId.invalid')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Description (optionnel)
   * - Max 1000 caractères
   */
  description: z.string()
    .max(1000, 'validation.description.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Ordre d'affichage (optionnel)
   * - Doit être >= 0
   * - Converti par react-hook-form avec valueAsNumber: true
   * - ✅ z.number() simple (pas de z.coerce)
   */
  displayOrder: z.number()
    .int('validation.displayOrder.integer')
    .min(0, 'validation.displayOrder.min')
    .optional(),

  /**
   * Statut actif/inactif (optionnel)
   */
  isActive: z.boolean().optional(),
})

/**
 * Schéma pour mise à jour
 * Ajoute le champ `version` obligatoire pour optimistic locking
 */
export const updateProductPackagingSchema = productPackagingSchema.extend({
  /**
   * Version pour optimistic locking
   * Doit être un entier positif
   */
  version: z.number()
    .int('validation.version.integer')
    .positive('validation.version.positive'),
})

/**
 * Type explicite pour les formulaires de création
 * Utilisé avec react-hook-form
 *
 * ✅ Type explicite au lieu de z.infer pour éviter unknown avec z.preprocess
 */
export type ProductPackagingFormData = {
  productId: string
  packagingLabel: string
  countryCode: string
  gtinEan?: string
  numeroAMM?: string
  concentration?: string
  unitId?: string
  description?: string
  displayOrder?: number
  isActive?: boolean
}

/**
 * Type pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateProductPackagingFormData = ProductPackagingFormData & {
  version: number
}
