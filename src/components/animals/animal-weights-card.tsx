"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Weight } from "@/lib/types/animal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnimalWeightsCardProps {
  weights: Weight[];
}

export function AnimalWeightsCard({ weights }: AnimalWeightsCardProps) {
  // Trier par date
  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.weighDate).getTime() - new Date(b.weighDate).getTime()
  );

  // Préparer les données pour le graphique
  const chartData = sortedWeights.map((w) => ({
    date: new Date(w.weighDate).toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    }),
    poids: w.weight,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution du Poids</CardTitle>
      </CardHeader>
      <CardContent>
        {weights.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucune pesée enregistrée</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-sm"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-sm"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  label={{ value: "kg", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="poids"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {sortedWeights.reverse().map((weight) => (
                <div
                  key={weight.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{weight.weight} kg</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(weight.weighDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  {weight.notes && (
                    <p className="text-sm text-muted-foreground">{weight.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
