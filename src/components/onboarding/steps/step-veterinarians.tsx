'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, X, UserPlus, Stethoscope, Phone, MapPin, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import type { OnboardingData } from '@/app/onboarding/page'

interface StepVeterinariansProps {
  data: OnboardingData
  onDataChange: (data: OnboardingData) => void
}

interface Veterinarian {
  id: string
  name: string
  city: string
  region: string
  phone?: string
}

interface LocalVet {
  id: string
  name: string
  region: string
  phone?: string
  isLocal: true
}

// Mock des vétérinaires du catalogue (à remplacer par API)
const MOCK_VETERINARIANS: Veterinarian[] = [
  { id: 'vet-1', name: 'Dr. Benali Ahmed', city: 'Alger Centre', region: 'ALG', phone: '0555 12 34 56' },
  { id: 'vet-2', name: 'Dr. Kaci Farid', city: 'Blida', region: 'BLI', phone: '0555 23 45 67' },
  { id: 'vet-3', name: 'Dr. Mansouri Leila', city: 'Tipaza', region: 'TIP', phone: '0555 34 56 78' },
  { id: 'vet-4', name: 'Dr. Hamdi Sara', city: 'Oran', region: 'ORA', phone: '0555 45 67 89' },
  { id: 'vet-5', name: 'Dr. Boudjema Karim', city: 'Alger Est', region: 'ALG' },
  { id: 'vet-6', name: 'Dr. Taleb Nadia', city: 'Blida', region: 'BLI', phone: '0555 56 78 90' },
  { id: 'vet-7', name: 'Dr. Cherif Mohamed', city: 'Tizi Ouzou', region: 'TIZ' },
  { id: 'vet-8', name: 'Dr. Amrani Fatima', city: 'Béjaïa', region: 'BEJ', phone: '0555 67 89 01' },
]

// Mapping région code -> nom
const REGION_NAMES: Record<string, string> = {
  ALG: 'Alger',
  ORA: 'Oran',
  CON: 'Constantine',
  BLI: 'Blida',
  SET: 'Sétif',
  BAT: 'Batna',
  TIP: 'Tipaza',
  TIZ: 'Tizi Ouzou',
  BEJ: 'Béjaïa',
  MSI: 'M\'Sila',
  MED: 'Médéa',
  TLE: 'Tlemcen',
}

export function StepVeterinarians({ data, onDataChange }: StepVeterinariansProps) {
  const t = useTranslations('onboarding.step3')

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVetName, setNewVetName] = useState('')
  const [newVetRegion, setNewVetRegion] = useState('')
  const [newVetPhone, setNewVetPhone] = useState('')
  const [localVets, setLocalVets] = useState<LocalVet[]>([])

  // Filtrer les vétérinaires par recherche multi-critères (nom, région, ville)
  const filteredVets = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_VETERINARIANS

    const query = searchQuery.toLowerCase()
    return MOCK_VETERINARIANS.filter((vet) => {
      const regionName = REGION_NAMES[vet.region]?.toLowerCase() || ''
      return (
        vet.name.toLowerCase().includes(query) ||
        vet.city.toLowerCase().includes(query) ||
        regionName.includes(query) ||
        vet.region.toLowerCase().includes(query)
      )
    })
  }, [searchQuery])

  // Vétérinaires sélectionnés (catalogue + locaux)
  const selectedVets = useMemo(() => {
    const catalogSelected = MOCK_VETERINARIANS.filter(v => data.veterinarians.includes(v.id))
    const localSelected = localVets.filter(v => data.veterinarians.includes(v.id))
    return [...catalogSelected, ...localSelected]
  }, [data.veterinarians, localVets])

  // Vétérinaires non sélectionnés dans la liste filtrée
  const availableVets = useMemo(() => {
    return filteredVets.filter(v => !data.veterinarians.includes(v.id))
  }, [filteredVets, data.veterinarians])

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
      region: newVetRegion.trim(),
      phone: newVetPhone.trim() || undefined,
      isLocal: true,
    }

    setLocalVets([...localVets, localVet])
    onDataChange({ ...data, veterinarians: [...data.veterinarians, localVet.id] })
    setNewVetName('')
    setNewVetRegion('')
    setNewVetPhone('')
    setShowAddForm(false)
  }

  const removeVet = (vetId: string) => {
    // Si c'est un vétérinaire local, le supprimer aussi de la liste locale
    if (vetId.startsWith('local-')) {
      setLocalVets(localVets.filter((v) => v.id !== vetId))
    }
    onDataChange({ ...data, veterinarians: data.veterinarians.filter((v) => v !== vetId) })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      {/* Vétérinaires sélectionnés */}
      {selectedVets.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            {t('selectedVets')} ({selectedVets.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedVets.map((vet) => {
              const isLocal = 'isLocal' in vet
              return (
                <div
                  key={vet.id}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                    ${isLocal
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                      : 'bg-primary/10 text-primary'}
                  `}
                >
                  {isLocal && <span>🏠</span>}
                  <span>{vet.name}</span>
                  <button
                    type="button"
                    onClick={() => removeVet(vet.id)}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Liste des vétérinaires disponibles */}
      <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
        {availableVets.map((vet) => (
          <div
            key={vet.id}
            onClick={() => toggleVeterinarian(vet.id)}
            className="flex items-center justify-between p-3 rounded-lg border cursor-pointer
                       transition-colors duration-150 border-muted hover:border-primary/50 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                <span className="text-lg">👨‍⚕️</span>
              </div>
              <div>
                <p className="font-medium text-sm">{vet.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {vet.city}
                  </span>
                  {vet.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span dir="ltr">{vet.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center">
              <Plus className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        ))}

        {availableVets.length === 0 && searchQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('noResults')}</p>
          </div>
        )}
      </div>

      {/* Bouton / Formulaire "Je ne trouve pas mon vétérinaire" */}
      {!showAddForm ? (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 border-2 border-dashed border-muted rounded-lg
                     text-muted-foreground hover:border-primary hover:text-primary
                     transition-colors duration-150 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          {t('addVet')}
        </button>
      ) : (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">{t('addVetTitle')}</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Nom */}
          <div className="space-y-1">
            <Label htmlFor="newVetName" className="text-sm">{t('vetName')} *</Label>
            <Input
              id="newVetName"
              placeholder={t('vetNamePlaceholder')}
              value={newVetName}
              onChange={(e) => setNewVetName(e.target.value)}
            />
          </div>

          {/* Région */}
          <div className="space-y-1">
            <Label htmlFor="newVetRegion" className="text-sm">
              {t('vetRegion')} <span className="text-muted-foreground">({t('optional')})</span>
            </Label>
            <Input
              id="newVetRegion"
              placeholder={t('vetRegionPlaceholder')}
              value={newVetRegion}
              onChange={(e) => setNewVetRegion(e.target.value)}
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-1">
            <Label htmlFor="newVetPhone" className="text-sm">
              {t('vetPhone')} <span className="text-muted-foreground">({t('optional')})</span>
            </Label>
            <Input
              id="newVetPhone"
              placeholder={t('vetPhonePlaceholder')}
              value={newVetPhone}
              onChange={(e) => setNewVetPhone(e.target.value)}
              type="tel"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddLocalVet}
              disabled={!newVetName.trim()}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('addVetTitle').replace('Ajouter ', '')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {t('localVetInfo')}
          </p>
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>{t('optionalStep')}</strong>
          <br />
          {t('optionalStepInfo')}
        </p>
      </div>
    </div>
  )
}
