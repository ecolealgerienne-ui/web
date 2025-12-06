/**
 * Schémas de validation Zod pour les Campagnes Nationales (Admin Reference Data)
 *
 * ✅ RÈGLE #1 : Toutes les erreurs utilisent des clés i18n
 * ✅ RÈGLE #6 : Messages d'erreur multilingues
 *
 * Utilisé par react-hook-form via zodResolver pour la validation côté client.
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   resolver: zodResolver(nationalCampaignSchema)
 * })
 * ```
 */

import { z } from 'zod'

/**
 * Types de campagnes valides
 */
const campaignTypes = [
  'vaccination',
  'deworming',
  'screening',
  'treatment',
  'census',
  'other',
] as const

/**
 * Schéma de validation pour la création d'une campagne nationale
 *
 * Tous les champs requis doivent être fournis.
 * Utilisé dans le formulaire de création.
 */
export const nationalCampaignSchema = z.object({
  code: z
    .string()
    .min(1, 'nationalCampaign.validation.code.required')
    .max(50, 'nationalCampaign.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'nationalCampaign.validation.code.pattern'
    ),

  nameFr: z
    .string()
    .min(1, 'nationalCampaign.validation.nameFr.required')
    .max(200, 'nationalCampaign.validation.nameFr.maxLength'),

  nameEn: z
    .string()
    .min(1, 'nationalCampaign.validation.nameEn.required')
    .max(200, 'nationalCampaign.validation.nameEn.maxLength'),

  nameAr: z
    .string()
    .min(1, 'nationalCampaign.validation.nameAr.required')
    .max(200, 'nationalCampaign.validation.nameAr.maxLength'),

  type: z.enum(campaignTypes, {
    message: 'nationalCampaign.validation.type.invalid',
  }),

  startDate: z
    .string()
    .min(1, 'nationalCampaign.validation.startDate.required')
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'nationalCampaign.validation.startDate.invalid'
    ),

  endDate: z
    .string()
    .min(1, 'nationalCampaign.validation.endDate.required')
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'nationalCampaign.validation.endDate.invalid'
    ),

  description: z
    .string()
    .max(1000, 'nationalCampaign.validation.description.maxLength')
    .optional()
    .or(z.literal('')),

  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    // Valider que endDate >= startDate
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end >= start
  },
  {
    message: 'nationalCampaign.validation.endDate.afterStart',
    path: ['endDate'],
  }
)

/**
 * Schéma de validation pour la mise à jour d'une campagne nationale
 *
 * Tous les champs sont optionnels sauf la version (optimistic locking).
 * Utilisé dans le formulaire d'édition.
 */
export const updateNationalCampaignSchema = z.object({
  code: z
    .string()
    .min(1, 'nationalCampaign.validation.code.required')
    .max(50, 'nationalCampaign.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'nationalCampaign.validation.code.pattern'
    )
    .optional(),

  nameFr: z
    .string()
    .min(1, 'nationalCampaign.validation.nameFr.required')
    .max(200, 'nationalCampaign.validation.nameFr.maxLength')
    .optional(),

  nameEn: z
    .string()
    .min(1, 'nationalCampaign.validation.nameEn.required')
    .max(200, 'nationalCampaign.validation.nameEn.maxLength')
    .optional(),

  nameAr: z
    .string()
    .min(1, 'nationalCampaign.validation.nameAr.required')
    .max(200, 'nationalCampaign.validation.nameAr.maxLength')
    .optional(),

  type: z
    .enum(campaignTypes, {
      message: 'nationalCampaign.validation.type.invalid',
    })
    .optional(),

  startDate: z
    .string()
    .min(1, 'nationalCampaign.validation.startDate.required')
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'nationalCampaign.validation.startDate.invalid'
    )
    .optional(),

  endDate: z
    .string()
    .min(1, 'nationalCampaign.validation.endDate.required')
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'nationalCampaign.validation.endDate.invalid'
    )
    .optional(),

  description: z
    .string()
    .max(1000, 'nationalCampaign.validation.description.maxLength')
    .optional()
    .or(z.literal('')),

  isActive: z.boolean().optional(),

  /**
   * Version pour l'optimistic locking (REQUIS en mode update)
   */
  version: z.number().int().positive(),
})

/**
 * Types inférés des schémas Zod
 */
export type NationalCampaignFormData = z.infer<typeof nationalCampaignSchema>
export type UpdateNationalCampaignFormData = z.infer<
  typeof updateNationalCampaignSchema
>
