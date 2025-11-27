'use client'

import { useState, useEffect } from 'react'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { SkeletonDashboard } from '@/components/ui/skeleton'

// Simuler le chargement des stats (à remplacer par un vrai appel API)
async function fetchDashboardStats() {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Pour le MVP, retourner des données mock
  // En production, ces données viendraient de l'API
  return {
    totalAnimals: 156, // Mettre à 0 pour voir l'état vide
    configuredVaccines: 5,
    configuredVeterinarians: 2,
  }
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<{
    totalAnimals: number
    configuredVaccines: number
    configuredVeterinarians: number
  } | undefined>(undefined)

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => {
        setStats(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching dashboard stats:', error)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return <SkeletonDashboard />
  }

  return <DashboardContent stats={stats} />
}
