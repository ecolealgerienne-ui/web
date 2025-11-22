/**
 * Types pour la gestion des événements d'animaux
 */

export type AnimalEventType = 
  | 'birth'
  | 'death'
  | 'sale'
  | 'purchase'
  | 'transfer'
  | 'health_check'
  | 'vaccination'
  | 'treatment'
  | 'weighing'
  | 'other';

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
