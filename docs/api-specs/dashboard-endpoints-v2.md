# API Specs - Dashboard Endpoints Phase 2

**Version:** 1.0
**Date:** 2025-12-08
**Statut:** À implémenter
**Priorité:** Haute

---

## Vue d'ensemble

Ces endpoints sont nécessaires pour le dashboard avancé avec analytics de performance.

**Base URL:** `/api/v1/farms/{farmId}/dashboard`

---

## 1. Stats par Lot

### `GET /api/v1/farms/{farmId}/lots/stats`

Retourne les statistiques de performance pour chaque lot actif.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Non | Filtrer par type de lot (fattening, weaning, etc.) |
| `isActive` | boolean | Non | Filtrer par statut actif (default: true) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "lots": [
      {
        "lotId": "uuid",
        "name": "Lot Engraissement A",
        "type": "fattening",
        "animalCount": 45,
        "weights": {
          "avgWeight": 380.5,
          "minWeight": 320.0,
          "maxWeight": 420.0,
          "targetWeight": 450.0
        },
        "growth": {
          "avgDailyGain": 0.92,
          "minDailyGain": 0.65,
          "maxDailyGain": 1.15
        },
        "predictions": {
          "estimatedDaysToTarget": 76,
          "estimatedTargetDate": "2025-02-22"
        },
        "lastWeighingDate": "2025-12-05"
      }
    ],
    "summary": {
      "totalLots": 5,
      "totalAnimals": 180,
      "overallAvgDailyGain": 0.85
    }
  }
}
```

**Calculs backend:**
- `avgDailyGain`: Moyenne des GMQ des animaux du lot (derniers 30 jours)
- `estimatedDaysToTarget`: `(targetWeight - avgWeight) / avgDailyGain`
- `avgWeight`: Moyenne des dernières pesées des animaux du lot

---

## 2. Classement Animaux par GMQ

### `GET /api/v1/farms/{farmId}/weights/rankings`

Retourne les animaux avec les meilleurs et pires GMQ.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `limit` | number | Non | 5 | Nombre d'animaux par catégorie |
| `period` | string | Non | 30d | Période d'analyse (7d, 30d, 90d) |
| `lotId` | string | Non | - | Filtrer par lot |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "calculatedAt": "2025-12-08T10:00:00Z",
    "top": [
      {
        "animalId": "uuid",
        "visualId": "FR1234567890",
        "officialNumber": "FR1234567890123",
        "avgDailyGain": 1.12,
        "weightGain": 33.6,
        "weighingsCount": 3,
        "currentWeight": 420.0,
        "lotName": "Engraissement A"
      }
    ],
    "bottom": [
      {
        "animalId": "uuid",
        "visualId": "FR5678901234",
        "officialNumber": "FR5678901234567",
        "avgDailyGain": 0.42,
        "weightGain": 12.6,
        "weighingsCount": 2,
        "currentWeight": 310.0,
        "lotName": "Sevrage B",
        "alert": "underperforming"
      }
    ],
    "thresholds": {
      "excellent": 1.0,
      "good": 0.8,
      "warning": 0.6,
      "critical": 0.5
    }
  }
}
```

---

## 3. Centre d'Actions Unifié

### `GET /api/v1/farms/{farmId}/dashboard/actions`

Retourne toutes les actions requises, priorisées et groupées.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "urgent": 2,
      "thisWeek": 5,
      "planned": 8,
      "opportunities": 3
    },
    "urgent": [
      {
        "id": "action-uuid-1",
        "type": "withdrawal_expiring",
        "priority": "critical",
        "title": "Délais d'attente viande",
        "description": "2 animaux en fin de délai d'attente",
        "count": 2,
        "expiresAt": "2025-12-11T00:00:00Z",
        "expiresIn": "3 days",
        "animals": [
          {
            "animalId": "uuid",
            "visualId": "FR1234",
            "withdrawalEndDate": "2025-12-11"
          }
        ],
        "actionUrl": "/treatments?filter=withdrawal"
      }
    ],
    "thisWeek": [
      {
        "id": "action-uuid-2",
        "type": "vaccination_due",
        "priority": "high",
        "title": "Vaccinations à effectuer",
        "description": "3 vaccinations dues cette semaine",
        "count": 3,
        "dueDate": "2025-12-15",
        "animals": [
          {
            "animalId": "uuid",
            "visualId": "FR2345",
            "vaccineName": "IBR",
            "nextDueDate": "2025-12-12"
          }
        ],
        "actionUrl": "/treatments?type=vaccination&status=scheduled"
      },
      {
        "id": "action-uuid-3",
        "type": "weighing_overdue",
        "priority": "medium",
        "title": "Pesées en retard",
        "description": "5 animaux non pesés depuis 30+ jours",
        "count": 5,
        "animals": [
          {
            "animalId": "uuid",
            "visualId": "FR3456",
            "lastWeighingDate": "2025-11-01",
            "daysSinceLastWeighing": 37
          }
        ],
        "actionUrl": "/weighings?filter=overdue"
      }
    ],
    "planned": [
      {
        "id": "action-uuid-4",
        "type": "calving_expected",
        "priority": "info",
        "title": "Vêlages prévus",
        "description": "5 vêlages attendus dans les 30 prochains jours",
        "count": 5,
        "periodStart": "2025-12-08",
        "periodEnd": "2025-01-07",
        "animals": [
          {
            "animalId": "uuid",
            "visualId": "FR4567",
            "expectedCalvingDate": "2025-12-20",
            "daysUntilCalving": 12
          }
        ],
        "actionUrl": "/animals?filter=pregnant"
      }
    ],
    "opportunities": [
      {
        "id": "action-uuid-5",
        "type": "sale_ready",
        "priority": "success",
        "title": "Animaux prêts pour vente",
        "description": "3 animaux ont atteint le poids cible",
        "count": 3,
        "animals": [
          {
            "animalId": "uuid",
            "visualId": "FR5678",
            "currentWeight": 455.0,
            "targetWeight": 450.0,
            "estimatedValue": 1911.0
          }
        ],
        "actionUrl": "/animals?filter=sale-ready"
      }
    ]
  }
}
```

**Types d'actions:**
| Type | Priorité | Description |
|------|----------|-------------|
| `withdrawal_expiring` | critical | Délais d'attente expirant bientôt |
| `treatment_overdue` | critical | Traitements en retard |
| `vaccination_due` | high | Vaccinations à effectuer |
| `weighing_overdue` | medium | Animaux non pesés depuis longtemps |
| `calving_expected` | info | Vêlages prévus |
| `sale_ready` | success | Animaux au poids cible |
| `underperforming` | warning | Animaux avec GMQ faible |

---

## 4. Historique GMQ Agrégé

### `GET /api/v1/farms/{farmId}/weights/trends`

Retourne l'évolution du GMQ moyen dans le temps pour graphiques.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `period` | string | Non | 6months | Période (1month, 3months, 6months, 1year) |
| `groupBy` | string | Non | week | Groupement (day, week, month) |
| `lotId` | string | Non | - | Filtrer par lot |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "period": "6months",
    "groupBy": "month",
    "startDate": "2025-06-01",
    "endDate": "2025-12-08",
    "dataPoints": [
      {
        "date": "2025-06",
        "avgDailyGain": 0.82,
        "animalCount": 180,
        "weighingsCount": 540,
        "avgWeight": 320.5
      },
      {
        "date": "2025-07",
        "avgDailyGain": 0.85,
        "animalCount": 195,
        "weighingsCount": 585,
        "avgWeight": 345.2
      },
      {
        "date": "2025-08",
        "avgDailyGain": 0.88,
        "animalCount": 210,
        "weighingsCount": 630,
        "avgWeight": 368.0
      }
    ],
    "summary": {
      "overallAvgDailyGain": 0.85,
      "trend": "increasing",
      "trendPercentage": 7.3
    },
    "benchmarks": {
      "farmTarget": 0.90,
      "nationalAverage": 0.80
    }
  }
}
```

---

## 5. Dashboard Stats Étendu

### `GET /api/v1/farms/{farmId}/dashboard/stats`

Endpoint unifié pour toutes les stats du dashboard (optimisé, une seule requête).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "herd": {
      "totalAnimals": 247,
      "byStatus": {
        "alive": 240,
        "sold": 5,
        "dead": 2
      },
      "bySex": {
        "male": 120,
        "female": 127
      },
      "changeThisMonth": +3,
      "changePercentage": 1.2
    },
    "movements": {
      "thisMonth": {
        "births": 12,
        "deaths": 2,
        "sales": 5,
        "purchases": 0
      },
      "previousMonth": {
        "births": 10,
        "deaths": 1,
        "sales": 8,
        "purchases": 3
      }
    },
    "weights": {
      "avgDailyGain": 0.87,
      "avgDailyGainTrend": "up",
      "avgDailyGainChange": 5.2,
      "avgWeight": 365.4,
      "totalWeighings": 459,
      "weighingsThisMonth": 45
    },
    "health": {
      "vaccinationsUpToDate": 235,
      "vaccinationsUpToDatePercentage": 95.1,
      "vaccinationsDueThisWeek": 3,
      "activeWithdrawals": 2,
      "treatmentsThisMonth": 12,
      "treatmentsCost": 2340.0
    },
    "mortality": {
      "rate": 1.2,
      "rateStatus": "good",
      "threshold": 2.0
    },
    "alerts": {
      "urgent": 2,
      "warning": 5,
      "info": 8
    },
    "lastUpdated": "2025-12-08T10:30:00Z"
  }
}
```

---

## 6. Anomalies & Insights (Optionnel - Phase 3)

### `GET /api/v1/farms/{farmId}/dashboard/insights`

Détection automatique d'anomalies et recommandations.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "id": "insight-uuid-1",
        "type": "anomaly",
        "severity": "warning",
        "title": "Baisse de performance détectée",
        "description": "Le lot 'Croissance' montre une baisse de GMQ de 12% depuis 2 semaines",
        "details": {
          "lotId": "uuid",
          "lotName": "Croissance",
          "metric": "avgDailyGain",
          "currentValue": 0.69,
          "previousValue": 0.78,
          "changePercentage": -11.5,
          "detectedAt": "2025-12-06"
        },
        "recommendation": "Vérifier la ration alimentaire et l'état sanitaire du lot",
        "actionUrl": "/lots/uuid"
      },
      {
        "id": "insight-uuid-2",
        "type": "prediction",
        "severity": "info",
        "title": "Pic de vêlages prévu",
        "description": "8 vêlages attendus entre le 15 et 22 janvier",
        "details": {
          "count": 8,
          "periodStart": "2025-01-15",
          "periodEnd": "2025-01-22"
        },
        "recommendation": "Préparer les boxes de vêlage et planifier la surveillance",
        "actionUrl": "/animals?filter=pregnant"
      },
      {
        "id": "insight-uuid-3",
        "type": "opportunity",
        "severity": "success",
        "title": "Opportunité de vente optimale",
        "description": "Prix du marché en hausse, 5 animaux au poids cible",
        "details": {
          "animalCount": 5,
          "totalWeight": 2275.0,
          "currentPrice": 4.2,
          "estimatedRevenue": 9555.0,
          "pricetrend": "up"
        },
        "recommendation": "Considérer la vente cette semaine pour maximiser les revenus",
        "actionUrl": "/animals?filter=sale-ready"
      }
    ],
    "generatedAt": "2025-12-08T10:30:00Z"
  }
}
```

---

## Priorité d'implémentation

| Endpoint | Priorité | Complexité | Dépendances |
|----------|----------|------------|-------------|
| `/dashboard/stats` | 🔴 Haute | Moyenne | Aucune |
| `/dashboard/actions` | 🔴 Haute | Haute | Aucune |
| `/lots/stats` | 🟠 Moyenne | Moyenne | Lots existants |
| `/weights/rankings` | 🟠 Moyenne | Faible | Weights existants |
| `/weights/trends` | 🟡 Basse | Moyenne | Weights existants |
| `/dashboard/insights` | 🟢 Optionnel | Haute | Tous les autres |

---

## Notes d'implémentation

### Performance
- Utiliser des vues matérialisées ou du caching Redis pour les stats agrégées
- Les calculs de GMQ doivent être pré-calculés (pas en temps réel)
- Limiter les requêtes N+1 avec des includes appropriés

### Calcul du GMQ
```sql
-- GMQ = (poids_actuel - poids_précédent) / jours_entre_pesées
-- GMQ moyen = moyenne des GMQ individuels sur la période
```

### Seuils recommandés
| Métrique | Excellent | Bon | Attention | Critique |
|----------|-----------|-----|-----------|----------|
| GMQ (kg/j) | > 1.0 | 0.8-1.0 | 0.6-0.8 | < 0.6 |
| Mortalité (%) | < 1 | 1-2 | 2-3 | > 3 |
| Vaccinations à jour (%) | > 95 | 90-95 | 80-90 | < 80 |
