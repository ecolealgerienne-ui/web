# Composants de Graphiques Flexibles

Ce dossier contient des composants de graphiques réutilisables basés sur **Recharts**.

## FlexibleChart

Un composant de graphique hautement configurable qui supporte plusieurs types de graphiques et périodes de données.

### Fonctionnalités

- **Types de graphiques**: Ligne, Barre, Aires
- **Sélection de période**: 6 mois, 12 mois, 1 an, 2 ans, Tout
- **Traductions**: Support complet i18n (FR/EN/AR)
- **Responsive**: S'adapte automatiquement à la taille de l'écran
- **Thème**: Support dark/light mode

### Utilisation de base

```tsx
import { FlexibleChart } from "@/components/ui/charts";

function MyPage() {
  const data = [
    { month: "Janvier", value: 100 },
    { month: "Février", value: 150 },
    { month: "Mars", value: 200 },
  ];

  return (
    <FlexibleChart
      title="Mon Graphique"
      data={data}
      dataKey="value"
      xAxisKey="month"
    />
  );
}
```

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `title` | `string` | - | Titre du graphique |
| `data` | `ChartDataPoint[]` | - | Données à afficher |
| `dataKey` | `string` | - | Clé pour les valeurs Y |
| `xAxisKey` | `string` | - | Clé pour les valeurs X |
| `defaultPeriod` | `ChartPeriod` | `"6months"` | Période par défaut |
| `defaultChartType` | `ChartType` | `"line"` | Type de graphique par défaut |
| `showPeriodSelector` | `boolean` | `true` | Afficher le sélecteur de période |
| `showTypeSelector` | `boolean` | `true` | Afficher le sélecteur de type |
| `onPeriodChange` | `(period: ChartPeriod) => void` | - | Callback lors du changement de période |
| `height` | `number` | `300` | Hauteur du graphique en pixels |
| `color` | `string` | `"hsl(var(--primary))"` | Couleur du graphique |

### Types

```typescript
type ChartType = "line" | "bar" | "area";
type ChartPeriod = "6months" | "12months" | "1year" | "2years" | "all";

interface ChartDataPoint {
  [key: string]: string | number;
}
```

### Exemples avancés

#### Avec changement de période

```tsx
const [period, setPeriod] = useState<ChartPeriod>('6months');
const data = fetchDataForPeriod(period);

<FlexibleChart
  title="Évolution"
  data={data}
  dataKey="animals"
  xAxisKey="month"
  defaultPeriod={period}
  onPeriodChange={setPeriod}
/>
```

#### Graphique en barres uniquement

```tsx
<FlexibleChart
  title="Statistiques mensuelles"
  data={data}
  dataKey="count"
  xAxisKey="month"
  defaultChartType="bar"
  showTypeSelector={false}
  color="hsl(var(--chart-1))"
/>
```

#### Sans sélecteurs

```tsx
<FlexibleChart
  title="Graphique simple"
  data={data}
  dataKey="value"
  xAxisKey="label"
  showPeriodSelector={false}
  showTypeSelector={false}
/>
```

## Traductions

Les traductions sont gérées automatiquement via `@/lib/i18n`. Les clés disponibles:

- `chart.periods.*`: Périodes (6months, 12months, etc.)
- `chart.types.*`: Types de graphiques (line, bar, area)
- `chart.labels.*`: Labels des sélecteurs

## Support de Recharts

Le composant utilise Recharts pour le rendu. Vous pouvez créer des composants personnalisés avec:

- `LineChart` - Graphiques en ligne
- `BarChart` - Graphiques en barres
- `AreaChart` - Graphiques en aires
- `PieChart` - Graphiques circulaires (à ajouter)
- `RadarChart` - Graphiques radar (à ajouter)

## Contribution

Pour ajouter un nouveau type de graphique:

1. Ajouter le type dans `ChartType`
2. Ajouter la traduction dans `/src/lib/i18n/messages/*.json`
3. Ajouter le rendu dans `renderChart()` du composant
