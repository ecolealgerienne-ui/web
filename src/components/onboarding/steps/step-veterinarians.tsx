'use client'

import { useState } from 'react'
import { Search, Plus, X, UserPlus, Stethoscope } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { OnboardingData } from '@/app/onboarding/page'

interface StepVeterinariansProps {
  data: OnboardingData
  onDataChange: (data: OnboardingData) => void
}

// Mock des vétérinaires du catalogue (à remplacer par API)
const MOCK_VETERINARIANS = [
  { id: 'vet-1', name: 'Dr. Benali Ahmed', city: 'Alger Centre', region: 'ALG' },
  { id: 'vet-2', name: 'Dr. Kaci Farid', city: 'Blida', region: 'BLI' },
  { id: 'vet-3', name: 'Dr. Mansouri Leila', city: 'Tipaza', region: 'TIP' },
  { id: 'vet-4', name: 'Dr. Hamdi Sara', city: 'Oran', region: 'ORA' },
  { id: 'vet-5', name: 'Dr. Boudjema Karim', city: 'Alger Est', region: 'ALG' },
  { id: 'vet-6', name: 'Dr. Taleb Nadia', city: 'Blida', region: 'BLI' },
  { id: 'vet-7', name: 'Dr. Cherif Mohamed', city: 'Tizi Ouzou', region: 'TIZ' },
  { id: 'vet-8', name: 'Dr. Amrani Fatima', city: 'Béjaïa', region: 'BEJ' },
]

interface LocalVet {
  id: string
  name: string
  region: string
  isLocal: true
}

export function StepVeterinarians({ data, onDataChange }: StepVeterinariansProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVetName, setNewVetName] = useState('')
  const [localVets, setLocalVets] = useState<LocalVet[]>([])

  // Filtrer les vétérinaires par recherche et région
  const filteredVets = MOCK_VETERINARIANS.filter((vet) => {
    const matchesSearch = vet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vet.city.toLowerCase().includes(searchQuery.toLowerCase())
    // Si une région est sélectionnée dans l'onboarding, on peut filtrer
    // Pour l'instant, on montre tous les vétérinaires
    return matchesSearch
  })

  const toggleVeterinarian = (vetId: string) => {
    const isSelected = data.veterinarians.includes(vetId)
    const newVets = isSelected
      ? data.veterinarians.filter((v) => v !== vetId)
      : [...data.veterinarians, vetId]

    onDataChange({ ...data, veterinarians: newVets })
  }

  const handleAddLocalVet = () => {
    if (!newVetName.trim()) return

    const localVet: LocalVet = {
      id: `local-vet-${Date.now()}`,
      name: newVetName.trim(),
      region: data.region,
      isLocal: true,
    }

    setLocalVets([...localVets, localVet])
    onDataChange({ ...data, veterinarians: [...data.veterinarians, localVet.id] })
    setNewVetName('')
    setShowAddForm(false)
  }

  const removeLocalVet = (vetId: string) => {
    setLocalVets(localVets.filter((v) => v.id !== vetId))
    onDataChange({ ...data, veterinarians: data.veterinarians.filter((v) => v !== vetId) })
  }

  const allVets = [...filteredVets, ...localVets]

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Vos vétérinaires</h2>
        <p className="text-muted-foreground mt-2">
          Sélectionnez vos vétérinaires habituels pour les retrouver facilement
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher un vétérinaire..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Liste des vétérinaires */}
      <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
        {allVets.map((vet) => {
          const isSelected = data.veterinarians.includes(vet.id)
          const isLocal = 'isLocal' in vet

          return (
            <div
              key={vet.id}
              onClick={() => !isLocal && toggleVeterinarian(vet.id)}
              className={`
                flex items-center justify-between p-3 rounded-lg border cursor-pointer
                transition-colors duration-150
                ${isSelected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
                ${isLocal ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isLocal ? 'bg-amber-100 dark:bg-amber-800' : 'bg-muted'}
                `}>
                  {isLocal ? (
                    <span className="text-lg">🏠</span>
                  ) : (
                    <span className="text-lg">👨‍⚕️</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{vet.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {'city' in vet ? vet.city : 'Vétérinaire local'}
                    {isLocal && <span className="ml-2 text-amber-600">(Privé)</span>}
                  </p>
                </div>
              </div>

              {isLocal ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeLocalVet(vet.id)
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              ) : (
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  transition-colors duration-150
                  ${isSelected ? 'bg-primary border-primary' : 'border-muted'}
                `}>
                  {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                </div>
              )}
            </div>
          )
        })}

        {filteredVets.length === 0 && localVets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun vétérinaire trouvé</p>
          </div>
        )}
      </div>

      {/* Bouton "Je ne trouve pas mon vétérinaire" */}
      {!showAddForm ? (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 border-2 border-dashed border-muted rounded-lg
                     text-muted-foreground hover:border-primary hover:text-primary
                     transition-colors duration-150 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Je ne trouve pas mon vétérinaire
        </button>
      ) : (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Ajouter un vétérinaire</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Nom du vétérinaire (ex: Dr. Martin)"
              value={newVetName}
              onChange={(e) => setNewVetName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddLocalVet} disabled={!newVetName.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ce vétérinaire sera ajouté comme donnée privée visible uniquement par vous.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Cette étape est optionnelle.</strong>
          <br />
          Vous pourrez ajouter ou modifier vos vétérinaires à tout moment dans les paramètres.
        </p>
      </div>
    </div>
  )
}
