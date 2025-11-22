/**
 * Types pour les campagnes (vaccination, traitement, pesée, identification)
 */

export type CampaignType = 'vaccination' | 'treatment' | 'weighing' | 'identification'
export type CampaignStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export interface Campaign {
  id: string
  farmId: string
  name: string
  type: CampaignType
  productId?: string
  productName?: string
  campaignDate: string
  status: CampaignStatus
  targetCount?: number
  completedCount?: number
  description?: string
  veterinarianId?: string
  veterinarianName?: string
  cost?: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCampaignDto {
  name: string
  type: CampaignType
  productId?: string
  productName?: string
  campaignDate: string
  status?: CampaignStatus
  targetCount?: number
  completedCount?: number
  description?: string
  veterinarianId?: string
  veterinarianName?: string
  cost?: number
  notes?: string
}

export interface UpdateCampaignDto {
  name?: string
  type?: CampaignType
  productId?: string
  productName?: string
  campaignDate?: string
  status?: CampaignStatus
  targetCount?: number
  completedCount?: number
  description?: string
  veterinarianId?: string
  veterinarianName?: string
  cost?: number
  notes?: string
}

export interface CampaignProgress {
  campaignId: string
  targetCount: number
  completedCount: number
  progressPercentage: number
  remainingCount: number
}
