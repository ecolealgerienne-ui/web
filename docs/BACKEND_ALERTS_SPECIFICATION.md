# Spécification Backend - Système d'Alertes Dynamiques

> Version: 1.0
> Date: 2024-12-09
> Statut: À implémenter

---

## 1. Vue d'Ensemble

### 1.1 Objectif
Implémenter un système d'alertes **100% dynamique** basé sur :
- Les templates créés par l'admin (`alert_templates`)
- Les préférences sélectionnées par le fermier (`alert_template_preferences`)
- Les alertes générées automatiquement (`farm_alerts`) - **NOUVEAU**

### 1.2 Architecture de Transition
```
┌─────────────────────────────────────────────────────────────────┐
│                        EXISTANT                                  │
├─────────────────────────────────────────────────────────────────┤
│  alert_templates          │  alert_template_preferences          │
│  (Admin - Catalogue)      │  (Fermier - Sélection)              │
│  ✅ CRUD complet          │  ✅ CRUD complet                     │
│  ✅ Multilingue           │  ✅ reminderDays                     │
│  ✅ Catégories/Priorités  │  ✅ displayOrder                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        NOUVEAU                                   │
├─────────────────────────────────────────────────────────────────┤
│  farm_alerts              │  AlertEngine                         │
│  (Alertes générées)       │  (Moteur de génération)             │
│  🆕 À créer               │  🆕 À créer                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Structures Existantes (Référence)

### 2.1 AlertTemplate (Admin)
```typescript
// src/lib/types/admin/alert-template.ts
interface AlertTemplate {
  id: string
  code: string                    // Ex: "VACC_DUE", "TREATMENT_EXPIRING"
  nameFr: string
  nameEn: string
  nameAr: string
  category: AlertCategory         // health | vaccination | treatment | reproduction | nutrition | administrative | other
  priority: AlertPriority         // low | medium | high | urgent
  descriptionFr?: string
  descriptionEn?: string
  descriptionAr?: string
  defaultReminderDays?: number    // 🆕 Valeur par défaut définie par l'admin
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

> **⚠️ IMPORTANT : Logique reminderDays**
> ```
> Priorité de la valeur reminderDays utilisée:
> 1. Fermier (alert_template_preferences.reminderDays) - si défini
> 2. Admin (alert_templates.defaultReminderDays) - si défini
> 3. Fallback système - 7 jours par défaut
> ```

### 2.2 AlertPreference (Fermier)
```typescript
// src/lib/types/alert-preference.ts
interface AlertPreference {
  id: string
  farmId: string
  alertTemplateId: string
  displayOrder: number
  isActive: boolean
  reminderDays?: number          // Jours avant l'échéance pour déclencher
  version?: number
  createdAt?: string
  updatedAt?: string
  alertTemplate: AlertTemplate   // Relation incluse
}
```

### 2.3 Endpoint Existant
```
GET  /api/v1/farms/{farmId}/alert-template-preferences
POST /api/v1/farms/{farmId}/alert-template-preferences
PUT  /api/v1/farms/{farmId}/alert-template-preferences/{id}
DELETE /api/v1/farms/{farmId}/alert-template-preferences/{id}
```

---

## 3. Nouvelle Structure : FarmAlert

### 3.1 Table SQL
```sql
-- Table des alertes générées par ferme
CREATE TABLE farm_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_template_id UUID NOT NULL REFERENCES alert_templates(id) ON DELETE CASCADE,
  alert_preference_id UUID REFERENCES alert_template_preferences(id) ON DELETE SET NULL,

  -- Contexte (permet de savoir POURQUOI l'alerte a été générée)
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,

  -- Dates
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,              -- Date d'échéance de l'action
  expires_at TIMESTAMP WITH TIME ZONE,            -- Auto-suppression après cette date

  -- Statut
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'dismissed', 'resolved')),
  read_at TIMESTAMP WITH TIME ZONE,
  read_on VARCHAR(10) CHECK (read_on IN ('web', 'mobile', 'email')),
  resolved_at TIMESTAMP WITH TIME ZONE,

  -- Données dynamiques (pour le message personnalisé)
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte d'unicité pour éviter les doublons
  CONSTRAINT unique_alert_per_context UNIQUE (
    farm_id,
    alert_template_id,
    animal_id,
    COALESCE(treatment_id, '00000000-0000-0000-0000-000000000000'::UUID)
  )
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_farm_alerts_farm_status ON farm_alerts(farm_id, status);
CREATE INDEX idx_farm_alerts_farm_pending ON farm_alerts(farm_id) WHERE status = 'pending';
CREATE INDEX idx_farm_alerts_due_date ON farm_alerts(farm_id, due_date) WHERE status = 'pending';
CREATE INDEX idx_farm_alerts_animal ON farm_alerts(animal_id) WHERE animal_id IS NOT NULL;
CREATE INDEX idx_farm_alerts_expires ON farm_alerts(expires_at) WHERE expires_at IS NOT NULL;
```

### 3.2 Type TypeScript
```typescript
// src/lib/types/farm-alert.ts

import type { AlertCategory, AlertPriority } from './admin/alert-template'

/**
 * Statut d'une alerte générée
 */
export type FarmAlertStatus = 'pending' | 'read' | 'dismissed' | 'resolved'

/**
 * Plateforme de lecture
 */
export type ReadPlatform = 'web' | 'mobile' | 'email'

/**
 * Alerte générée pour une ferme
 */
export interface FarmAlert {
  id: string
  farmId: string
  alertTemplateId: string
  alertPreferenceId?: string

  // Contexte
  animalId?: string
  lotId?: string
  treatmentId?: string

  // Dates
  triggeredAt: string
  dueDate?: string
  expiresAt?: string

  // Statut
  status: FarmAlertStatus
  readAt?: string
  readOn?: ReadPlatform
  resolvedAt?: string

  // Données dynamiques
  metadata: FarmAlertMetadata

  // Relations (incluses dans les réponses API)
  alertTemplate?: {
    id: string
    code: string
    nameFr: string
    nameEn?: string
    nameAr?: string
    category: AlertCategory
    priority: AlertPriority
    descriptionFr?: string
  }
  animal?: {
    id: string
    visualId?: string
    officialNumber?: string
  }
  lot?: {
    id: string
    name: string
  }

  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Métadonnées dynamiques de l'alerte
 * Permet de personnaliser le message sans modifier le template
 */
export interface FarmAlertMetadata {
  // Informations calculées
  daysUntilDue?: number
  daysOverdue?: number

  // Données spécifiques par catégorie
  vaccineName?: string
  treatmentName?: string
  lastWeighingDate?: string
  currentWeight?: number
  expectedWeight?: number

  // Pour les messages personnalisés
  customMessage?: string

  // Extensible
  [key: string]: any
}

/**
 * Résumé des alertes (pour badge/compteurs)
 */
export interface FarmAlertsSummary {
  total: number
  unread: number
  byStatus: Record<FarmAlertStatus, number>
  byCategory: Record<AlertCategory, number>
  byPriority: Record<AlertPriority, number>
}

/**
 * Filtres pour la liste des alertes
 */
export interface FarmAlertsFilterParams {
  status?: FarmAlertStatus | FarmAlertStatus[]
  category?: AlertCategory | AlertCategory[]
  priority?: AlertPriority | AlertPriority[]
  animalId?: string
  lotId?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
  orderBy?: 'triggeredAt' | 'dueDate' | 'priority' | 'status'
  order?: 'ASC' | 'DESC'
}

/**
 * DTO pour mettre à jour le statut d'une alerte
 */
export interface UpdateFarmAlertDto {
  status: FarmAlertStatus
  readOn?: ReadPlatform
}

/**
 * DTO pour marquer plusieurs alertes comme lues
 */
export interface BulkUpdateFarmAlertsDto {
  alertIds: string[]
  status: FarmAlertStatus
  readOn?: ReadPlatform
}
```

---

## 4. API Endpoints

### 4.1 Endpoints Alertes Générées

```yaml
# Liste des alertes d'une ferme
GET /api/v1/farms/{farmId}/alerts
  Query Parameters:
    - status: pending | read | dismissed | resolved (multiple avec virgule)
    - category: health | vaccination | ... (multiple avec virgule)
    - priority: low | medium | high | urgent
    - animalId: UUID
    - lotId: UUID
    - fromDate: ISO date
    - toDate: ISO date
    - page: number (default: 1)
    - limit: number (default: 20, max: 100)
    - orderBy: triggeredAt | dueDate | priority (default: triggeredAt)
    - order: ASC | DESC (default: DESC)
  Response:
    {
      "data": FarmAlert[],
      "meta": {
        "total": number,
        "page": number,
        "limit": number,
        "totalPages": number
      }
    }

# Résumé/Compteurs (léger, pour polling)
GET /api/v1/farms/{farmId}/alerts/summary
  Response:
    {
      "total": 12,
      "unread": 5,
      "byStatus": { "pending": 5, "read": 7, ... },
      "byCategory": { "vaccination": 3, "health": 2, ... },
      "byPriority": { "urgent": 1, "high": 2, ... }
    }

# Compteur non-lus uniquement (ultra-léger, pour badge)
GET /api/v1/farms/{farmId}/alerts/unread-count
  Response:
    { "count": 5 }

# Détail d'une alerte
GET /api/v1/farms/{farmId}/alerts/{alertId}
  Response: FarmAlert (avec relations complètes)

# Mettre à jour le statut d'une alerte
PATCH /api/v1/farms/{farmId}/alerts/{alertId}
  Body:
    {
      "status": "read" | "dismissed" | "resolved",
      "readOn": "web" | "mobile"  // optionnel
    }
  Response: FarmAlert

# Marquer toutes comme lues
POST /api/v1/farms/{farmId}/alerts/mark-all-read
  Body:
    {
      "readOn": "web" | "mobile"
    }
  Response:
    { "updatedCount": number }

# Mise à jour en lot
POST /api/v1/farms/{farmId}/alerts/bulk-update
  Body:
    {
      "alertIds": ["uuid1", "uuid2", ...],
      "status": "read" | "dismissed",
      "readOn": "web" | "mobile"
    }
  Response:
    { "updatedCount": number }

# Générer/Rafraîchir les alertes (On-Demand)
POST /api/v1/farms/{farmId}/alerts/generate
  Description: Force la génération des alertes basée sur les préférences actuelles
  Response:
    {
      "generated": number,
      "resolved": number,
      "unchanged": number
    }
```

### 4.2 Codes de Réponse
```yaml
200: Succès
201: Créé (pour generate)
400: Paramètres invalides
401: Non authentifié
403: Pas d'accès à cette ferme
404: Alerte non trouvée
422: Données invalides
500: Erreur serveur
```

---

## 5. Moteur de Génération d'Alertes (AlertEngine)

### 5.1 Architecture du Moteur

```typescript
// src/lib/services/alerts/alert-engine.ts

/**
 * Interface pour les générateurs d'alertes par catégorie
 * Chaque catégorie a sa propre logique de détection
 */
interface AlertGenerator {
  category: AlertCategory
  generate(farmId: string, preferences: AlertPreference[]): Promise<GeneratedAlert[]>
}

/**
 * Alerte générée (avant insertion en BDD)
 */
interface GeneratedAlert {
  alertTemplateId: string
  alertPreferenceId: string
  animalId?: string
  lotId?: string
  treatmentId?: string
  dueDate?: Date
  expiresAt?: Date
  metadata: FarmAlertMetadata
}

/**
 * Moteur principal de génération
 */
class AlertEngine {
  private generators: Map<AlertCategory, AlertGenerator>

  constructor() {
    this.generators = new Map()
    this.registerGenerator(new VaccinationAlertGenerator())
    this.registerGenerator(new TreatmentAlertGenerator())
    this.registerGenerator(new HealthAlertGenerator())
    this.registerGenerator(new ReproductionAlertGenerator())
    this.registerGenerator(new NutritionAlertGenerator())
    this.registerGenerator(new AdministrativeAlertGenerator())
  }

  /**
   * Génère toutes les alertes pour une ferme
   * Basé sur les préférences actives du fermier
   */
  async generateForFarm(farmId: string): Promise<GenerationResult> {
    // 1. Récupérer les préférences actives
    const preferences = await this.getActivePreferences(farmId)

    // 2. Grouper par catégorie
    const byCategory = this.groupByCategory(preferences)

    // 3. Générer pour chaque catégorie
    const allGenerated: GeneratedAlert[] = []
    for (const [category, prefs] of byCategory) {
      const generator = this.generators.get(category)
      if (generator) {
        const alerts = await generator.generate(farmId, prefs)
        allGenerated.push(...alerts)
      }
    }

    // 4. Synchroniser avec la BDD (insert/update/resolve)
    return this.syncAlerts(farmId, allGenerated)
  }
}
```

### 5.2 Générateurs par Catégorie

#### 5.2.0 Helper : Calcul reminderDays
```typescript
/**
 * Calcule la valeur reminderDays selon la priorité:
 * 1. Valeur fermier (préférence)
 * 2. Valeur admin (template)
 * 3. Fallback système
 */
function getReminderDays(
  pref: AlertPreference,
  systemDefault: number = 7
): number {
  // 1. Priorité: valeur du fermier
  if (pref.reminderDays !== null && pref.reminderDays !== undefined) {
    return pref.reminderDays
  }
  // 2. Sinon: valeur par défaut de l'admin
  if (pref.alertTemplate?.defaultReminderDays !== null &&
      pref.alertTemplate?.defaultReminderDays !== undefined) {
    return pref.alertTemplate.defaultReminderDays
  }
  // 3. Sinon: fallback système
  return systemDefault
}
```

#### 5.2.1 Vaccination
```typescript
class VaccinationAlertGenerator implements AlertGenerator {
  category: AlertCategory = 'vaccination'

  async generate(farmId: string, preferences: AlertPreference[]): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = []

    for (const pref of preferences) {
      // Utilise: fermier → admin → 7 jours par défaut
      const reminderDays = getReminderDays(pref, 7)

      // Récupérer les animaux avec vaccinations à venir
      const animals = await this.getAnimalsNeedingVaccination(
        farmId,
        pref.alertTemplate.code,  // Ex: "VACC_ANNUAL", "VACC_BRUCELLOSIS"
        reminderDays
      )

      for (const animal of animals) {
        alerts.push({
          alertTemplateId: pref.alertTemplateId,
          alertPreferenceId: pref.id,
          animalId: animal.id,
          lotId: animal.lotId,
          dueDate: animal.nextVaccinationDate,
          expiresAt: this.calculateExpiry(animal.nextVaccinationDate),
          metadata: {
            daysUntilDue: this.daysDiff(new Date(), animal.nextVaccinationDate),
            vaccineName: animal.vaccineName,
            lastVaccinationDate: animal.lastVaccinationDate,
          }
        })
      }
    }

    return alerts
  }
}
```

#### 5.2.2 Traitement
```typescript
class TreatmentAlertGenerator implements AlertGenerator {
  category: AlertCategory = 'treatment'

  async generate(farmId: string, preferences: AlertPreference[]): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = []

    for (const pref of preferences) {
      // Utilise: fermier → admin → 3 jours par défaut
      const reminderDays = getReminderDays(pref, 3)

      // Alertes possibles:
      // - TREATMENT_EXPIRING: Traitements qui se terminent bientôt
      // - TREATMENT_WITHDRAWAL: Délai d'attente en cours
      // - TREATMENT_RENEWAL: Traitements à renouveler

      const treatments = await this.getTreatmentsNeedingAttention(
        farmId,
        pref.alertTemplate.code,
        reminderDays
      )

      for (const treatment of treatments) {
        alerts.push({
          alertTemplateId: pref.alertTemplateId,
          alertPreferenceId: pref.id,
          animalId: treatment.animalId,
          treatmentId: treatment.id,
          dueDate: treatment.endDate,
          metadata: {
            treatmentName: treatment.name,
            daysUntilEnd: this.daysDiff(new Date(), treatment.endDate),
            withdrawalEndDate: treatment.withdrawalEndDate,
          }
        })
      }
    }

    return alerts
  }
}
```

#### 5.2.3 Nutrition (Pesées)
```typescript
class NutritionAlertGenerator implements AlertGenerator {
  category: AlertCategory = 'nutrition'

  async generate(farmId: string, preferences: AlertPreference[]): Promise<GeneratedAlert[]> {
    const alerts: GeneratedAlert[] = []

    for (const pref of preferences) {
      // Alertes possibles:
      // - WEIGHING_DUE: Animaux à peser
      // - GMQ_LOW: GMQ en dessous du seuil
      // - WEIGHT_LOSS: Perte de poids détectée

      // Utilise: fermier → admin → 30 jours par défaut (intervalle pesée)
      const reminderDays = getReminderDays(pref, 30)

      switch (pref.alertTemplate.code) {
        case 'WEIGHING_DUE':
          const animalsToWeigh = await this.getAnimalsNeedingWeighing(
            farmId,
            reminderDays
          )
          for (const animal of animalsToWeigh) {
            alerts.push({
              alertTemplateId: pref.alertTemplateId,
              alertPreferenceId: pref.id,
              animalId: animal.id,
              lotId: animal.lotId,
              metadata: {
                lastWeighingDate: animal.lastWeighingDate,
                daysSinceLastWeighing: animal.daysSinceLastWeighing,
                currentWeight: animal.lastWeight,
              }
            })
          }
          break

        case 'GMQ_LOW':
          const lowGmqAnimals = await this.getAnimalsWithLowGmq(farmId)
          // ... générer alertes
          break
      }
    }

    return alerts
  }
}
```

#### 5.2.4 Reproduction
```typescript
class ReproductionAlertGenerator implements AlertGenerator {
  category: AlertCategory = 'reproduction'

  async generate(farmId: string, preferences: AlertPreference[]): Promise<GeneratedAlert[]> {
    // Alertes possibles:
    // - CALVING_DUE: Mise-bas prévue
    // - HEAT_EXPECTED: Chaleurs attendues
    // - PREGNANCY_CHECK: Contrôle de gestation à faire
    // ...
  }
}
```

#### 5.2.5 Santé Générale
```typescript
class HealthAlertGenerator implements AlertGenerator {
  category: AlertCategory = 'health'

  async generate(farmId: string, preferences: AlertPreference[]): Promise<GeneratedAlert[]> {
    // Alertes possibles:
    // - HEALTH_CHECK_DUE: Contrôle sanitaire à faire
    // - QUARANTINE_ENDING: Fin de quarantaine
    // ...
  }
}
```

#### 5.2.6 Administrative
```typescript
class AdministrativeAlertGenerator implements AlertGenerator {
  category: AlertCategory = 'administrative'

  async generate(farmId: string, preferences: AlertPreference[]): Promise<GeneratedAlert[]> {
    // Alertes possibles:
    // - DOCUMENT_EXPIRING: Document à renouveler
    // - IDENTIFICATION_MISSING: Animal non identifié
    // - REGISTRATION_INCOMPLETE: Enregistrement incomplet
    // ...
  }
}
```

### 5.3 Synchronisation des Alertes

```typescript
/**
 * Synchronise les alertes générées avec la BDD
 * - Crée les nouvelles alertes
 * - Résout automatiquement les alertes obsolètes
 * - Ne touche pas aux alertes dismissed par l'utilisateur
 */
async syncAlerts(farmId: string, generated: GeneratedAlert[]): Promise<GenerationResult> {
  const result = { generated: 0, resolved: 0, unchanged: 0 }

  // 1. Récupérer les alertes existantes (pending + read)
  const existing = await this.getExistingAlerts(farmId, ['pending', 'read'])

  // 2. Créer un index pour comparaison rapide
  const existingIndex = this.createAlertIndex(existing)
  const generatedIndex = this.createAlertIndex(generated)

  // 3. Nouvelles alertes à créer
  for (const alert of generated) {
    const key = this.getAlertKey(alert)
    if (!existingIndex.has(key)) {
      await this.insertAlert(farmId, alert)
      result.generated++
    } else {
      result.unchanged++
    }
  }

  // 4. Alertes à résoudre (plus dans la liste générée = condition résolue)
  for (const alert of existing) {
    const key = this.getAlertKey(alert)
    if (!generatedIndex.has(key) && alert.status !== 'dismissed') {
      await this.resolveAlert(alert.id)
      result.resolved++
    }
  }

  return result
}

/**
 * Clé unique pour identifier une alerte
 * Permet de détecter les doublons et les résolutions
 */
getAlertKey(alert: GeneratedAlert | FarmAlert): string {
  return `${alert.alertTemplateId}:${alert.animalId || 'null'}:${alert.treatmentId || 'null'}`
}
```

---

## 6. Service API (Frontend)

### 6.1 Interface d'Abstraction (pour migration Redis future)

```typescript
// src/lib/services/alerts/alert-cache.interface.ts

/**
 * Interface d'abstraction pour le cache d'alertes
 * Permet de swapper PostgreSQL → Redis sans changer le code appelant
 */
export interface IAlertCache {
  /**
   * Récupère les alertes d'une ferme
   */
  getAlerts(farmId: string, filters?: FarmAlertsFilterParams): Promise<{
    data: FarmAlert[]
    meta: PaginationMeta
  }>

  /**
   * Récupère le résumé des alertes
   */
  getSummary(farmId: string): Promise<FarmAlertsSummary>

  /**
   * Récupère uniquement le compteur non-lus
   */
  getUnreadCount(farmId: string): Promise<number>

  /**
   * Invalide le cache pour une ferme
   * (appelé après une action utilisateur ou génération)
   */
  invalidate(farmId: string): Promise<void>
}
```

### 6.2 Implémentation PostgreSQL (Phase 1)

```typescript
// src/lib/services/alerts/postgres-alert-cache.ts

export class PostgresAlertCache implements IAlertCache {
  async getAlerts(farmId: string, filters?: FarmAlertsFilterParams) {
    // Appel direct à l'API REST qui query PostgreSQL
    const response = await apiClient.get(`/api/v1/farms/${farmId}/alerts`, {
      params: filters
    })
    return response
  }

  async getSummary(farmId: string) {
    const response = await apiClient.get(`/api/v1/farms/${farmId}/alerts/summary`)
    return response
  }

  async getUnreadCount(farmId: string) {
    const response = await apiClient.get(`/api/v1/farms/${farmId}/alerts/unread-count`)
    return response.count
  }

  async invalidate(farmId: string) {
    // Pas de cache côté client en Phase 1
    // Cette méthode sera utile en Phase 2 avec Redis
  }
}
```

### 6.3 Implémentation Redis (Phase 2 - Future)

```typescript
// src/lib/services/alerts/redis-alert-cache.ts

export class RedisAlertCache implements IAlertCache {
  private readonly TTL = 900 // 15 minutes

  async getAlerts(farmId: string, filters?: FarmAlertsFilterParams) {
    const cacheKey = `alerts:${farmId}:${this.hashFilters(filters)}`

    // 1. Check Redis cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // 2. Cache miss → fetch from API
    const response = await apiClient.get(`/api/v1/farms/${farmId}/alerts`, {
      params: filters
    })

    // 3. Store in Redis with TTL
    await redis.setex(cacheKey, this.TTL, JSON.stringify(response))

    return response
  }

  async invalidate(farmId: string) {
    // Supprimer toutes les clés pour cette ferme
    const keys = await redis.keys(`alerts:${farmId}:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}
```

### 6.4 Service Principal

```typescript
// src/lib/services/alerts/farm-alerts.service.ts

import { PostgresAlertCache } from './postgres-alert-cache'
import type { IAlertCache } from './alert-cache.interface'

class FarmAlertsService {
  private cache: IAlertCache

  constructor() {
    // Phase 1: PostgreSQL direct
    this.cache = new PostgresAlertCache()

    // Phase 2: Décommenter pour Redis
    // this.cache = new RedisAlertCache()
  }

  private getBasePath(farmId: string) {
    return `/api/v1/farms/${farmId}/alerts`
  }

  /**
   * Récupère les alertes avec filtres
   */
  async getAlerts(farmId: string, filters?: FarmAlertsFilterParams) {
    return this.cache.getAlerts(farmId, filters)
  }

  /**
   * Récupère le résumé (pour dashboard)
   */
  async getSummary(farmId: string) {
    return this.cache.getSummary(farmId)
  }

  /**
   * Récupère le compteur non-lus (pour badge header)
   */
  async getUnreadCount(farmId: string) {
    return this.cache.getUnreadCount(farmId)
  }

  /**
   * Met à jour le statut d'une alerte
   */
  async updateStatus(farmId: string, alertId: string, data: UpdateFarmAlertDto) {
    const response = await apiClient.patch(
      `${this.getBasePath(farmId)}/${alertId}`,
      data
    )

    // Invalider le cache après modification
    await this.cache.invalidate(farmId)

    return response
  }

  /**
   * Marque toutes les alertes comme lues
   */
  async markAllAsRead(farmId: string, readOn: ReadPlatform = 'web') {
    const response = await apiClient.post(
      `${this.getBasePath(farmId)}/mark-all-read`,
      { readOn }
    )

    await this.cache.invalidate(farmId)

    return response
  }

  /**
   * Force la génération des alertes
   */
  async generateAlerts(farmId: string) {
    const response = await apiClient.post(
      `${this.getBasePath(farmId)}/generate`
    )

    await this.cache.invalidate(farmId)

    return response
  }
}

export const farmAlertsService = new FarmAlertsService()
```

---

## 7. Codes d'Alerte Standards

### 7.1 Catalogue Recommandé

| Code | Catégorie | Priorité | Description |
|------|-----------|----------|-------------|
| `VACC_DUE` | vaccination | high | Vaccination à effectuer |
| `VACC_OVERDUE` | vaccination | urgent | Vaccination en retard |
| `VACC_ANNUAL_DUE` | vaccination | medium | Rappel annuel à prévoir |
| `TREATMENT_ENDING` | treatment | medium | Traitement se termine bientôt |
| `TREATMENT_OVERDUE` | treatment | high | Traitement à renouveler |
| `WITHDRAWAL_ACTIVE` | treatment | high | Délai d'attente en cours |
| `WITHDRAWAL_ENDING` | treatment | low | Délai d'attente se termine |
| `WEIGHING_DUE` | nutrition | medium | Pesée à effectuer |
| `GMQ_LOW` | nutrition | high | GMQ inférieur au seuil |
| `GMQ_CRITICAL` | nutrition | urgent | GMQ critique |
| `WEIGHT_LOSS` | nutrition | high | Perte de poids détectée |
| `CALVING_SOON` | reproduction | high | Mise-bas imminente |
| `HEAT_EXPECTED` | reproduction | medium | Chaleurs attendues |
| `PREGNANCY_CHECK` | reproduction | medium | Contrôle gestation à faire |
| `HEALTH_CHECK_DUE` | health | medium | Contrôle sanitaire à prévoir |
| `QUARANTINE_ENDING` | health | low | Fin de quarantaine proche |
| `DOC_EXPIRING` | administrative | medium | Document expire bientôt |
| `ID_MISSING` | administrative | high | Identification manquante |

### 7.2 Messages Templates (Exemples)

```json
{
  "VACC_DUE": {
    "fr": "Vaccination {vaccineName} à effectuer pour {animalId} dans {daysUntilDue} jours",
    "en": "Vaccination {vaccineName} due for {animalId} in {daysUntilDue} days",
    "ar": "تطعيم {vaccineName} مستحق لـ {animalId} في {daysUntilDue} أيام"
  },
  "GMQ_LOW": {
    "fr": "GMQ faible ({currentGmq} kg/j) pour {animalId} - Seuil: {threshold} kg/j",
    "en": "Low ADG ({currentGmq} kg/d) for {animalId} - Threshold: {threshold} kg/d",
    "ar": "معدل نمو يومي منخفض ({currentGmq} كجم/يوم) لـ {animalId}"
  }
}
```

---

## 8. Triggers d'Invalidation

### 8.1 Actions qui Invalident le Cache

| Action | Invalidation |
|--------|--------------|
| Vaccination enregistrée | `invalidate(farmId)` |
| Traitement ajouté/terminé | `invalidate(farmId)` |
| Pesée enregistrée | `invalidate(farmId)` |
| Préférence alerte modifiée | `invalidate(farmId)` |
| Alerte lue/dismissée | `invalidate(farmId)` |
| Animal supprimé | `invalidate(farmId)` |

### 8.2 Implémentation dans les Services Existants

```typescript
// Exemple dans treatments.service.ts
async createTreatment(farmId: string, data: CreateTreatmentDto) {
  const treatment = await apiClient.post(`/api/v1/farms/${farmId}/treatments`, data)

  // Invalider le cache des alertes car les conditions ont changé
  await farmAlertsService.invalidateCache(farmId)

  return treatment
}
```

---

## 9. Migration vers Redis (Phase 2)

### 9.1 Checklist de Migration

- [ ] Installer Redis (ou utiliser service managé)
- [ ] Ajouter client Redis au projet backend
- [ ] Créer `RedisAlertCache` implémentant `IAlertCache`
- [ ] Configurer variable d'environnement `USE_REDIS_CACHE=true`
- [ ] Modifier le constructeur de `FarmAlertsService` pour choisir l'implémentation
- [ ] Ajouter Pub/Sub pour notifications temps réel (optionnel)

### 9.2 Changement Minimal Requis

```typescript
// farm-alerts.service.ts
constructor() {
  if (process.env.USE_REDIS_CACHE === 'true') {
    this.cache = new RedisAlertCache()
  } else {
    this.cache = new PostgresAlertCache()
  }
}
```

---

## 10. Résumé des Fichiers à Créer

### Backend (API)
```
backend/
├── src/
│   ├── modules/
│   │   └── alerts/
│   │       ├── alerts.module.ts
│   │       ├── alerts.controller.ts
│   │       ├── alerts.service.ts
│   │       ├── alert-engine/
│   │       │   ├── alert-engine.service.ts
│   │       │   ├── generators/
│   │       │   │   ├── vaccination.generator.ts
│   │       │   │   ├── treatment.generator.ts
│   │       │   │   ├── nutrition.generator.ts
│   │       │   │   ├── reproduction.generator.ts
│   │       │   │   ├── health.generator.ts
│   │       │   │   └── administrative.generator.ts
│   │       │   └── generator.interface.ts
│   │       ├── dto/
│   │       │   ├── farm-alert.dto.ts
│   │       │   ├── update-alert.dto.ts
│   │       │   └── filter-alerts.dto.ts
│   │       └── entities/
│   │           └── farm-alert.entity.ts
│   └── database/
│       └── migrations/
│           └── xxx_create_farm_alerts_table.ts
```

### Frontend (Web)
```
src/lib/
├── types/
│   └── farm-alert.ts                    # Types TypeScript
├── services/
│   └── alerts/
│       ├── alert-cache.interface.ts     # Interface abstraction
│       ├── postgres-alert-cache.ts      # Implémentation Phase 1
│       └── farm-alerts.service.ts       # Service principal
└── hooks/
    ├── useFarmAlerts.ts                 # Hook liste alertes
    └── useUnreadAlertsCount.ts          # Hook compteur badge
```

---

## 11. Priorité d'Implémentation

| Ordre | Composant | Effort | Impact |
|-------|-----------|--------|--------|
| 1 | Table `farm_alerts` + Migration | 1h | Base |
| 2 | Endpoints API CRUD | 2h | Base |
| 3 | `VaccinationAlertGenerator` | 2h | Quick win |
| 4 | `TreatmentAlertGenerator` | 2h | Quick win |
| 5 | `NutritionAlertGenerator` | 2h | High value |
| 6 | Service frontend + Hook | 1h | Integration |
| 7 | Autres générateurs | 4h | Completeness |
| 8 | Migration Redis (future) | 2h | Performance |

---

*Document généré pour l'équipe de développement AniTra*
