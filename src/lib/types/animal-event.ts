/**
 * Types pour la gestion des événements d'animaux (mouvements)
 * Aligné avec le backend MovementType enum
 */

export type AnimalEventType =
  | 'entry'
  | 'exit'
  | 'birth'
  | 'death'
  | 'sale'
  | 'purchase'
  | 'transfer_in'
  | 'transfer_out'
  | 'temporary_out'
  | 'temporary_return';

export interface AnimalEvent {
  id: string;
  farmId: string;
  animalId: string;
  eventType: AnimalEventType;
  eventDate: string;
  title: string;
  description?: string;
  performedBy?: string;
  veterinarianId?: string;
  cost?: number;
  relatedAnimalId?: string;
  location?: string;
  notes?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnimalEventDto {
  animalId: string;
  eventType: AnimalEventType;
  eventDate: string;
  title: string;
  description?: string;
  performedBy?: string;
  veterinarianId?: string;
  cost?: number;
  relatedAnimalId?: string;
  location?: string;
  notes?: string;
  attachments?: string[];
}

export interface UpdateAnimalEventDto {
  animalId?: string;
  eventType?: AnimalEventType;
  eventDate?: string;
  title?: string;
  description?: string;
  performedBy?: string;
  veterinarianId?: string;
  cost?: number;
  relatedAnimalId?: string;
  location?: string;
  notes?: string;
  attachments?: string[];
}
