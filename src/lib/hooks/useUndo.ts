'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * Configuration pour une opération undoable
 */
interface UndoableOperation<T> {
  /** ID unique de l'opération */
  id: string
  /** Données de l'élément concerné */
  data: T
  /** Timestamp de l'opération */
  timestamp: number
  /** Fonction de restauration */
  restore: () => void
  /** Fonction de suppression définitive */
  hardDelete: () => void
  /** Timer pour la suppression automatique */
  timerId?: ReturnType<typeof setTimeout>
}

interface UseUndoOptions {
  /** Durée avant suppression définitive (ms) - défaut: 10000 */
  undoDuration?: number
  /** Callback après suppression définitive */
  onHardDelete?: (id: string) => void
  /** Callback après restauration */
  onRestore?: (id: string) => void
}

interface UseUndoReturn<T> {
  /** Opérations en attente de confirmation */
  pendingOperations: UndoableOperation<T>[]

  /**
   * Marque un élément pour suppression (soft delete)
   * Retourne l'ID de l'opération pour le toast
   */
  markForDeletion: (
    id: string,
    data: T,
    onRestore: () => void,
    onHardDelete: () => void
  ) => string

  /** Annule une opération (restaure l'élément) */
  undoOperation: (operationId: string) => void

  /** Force la suppression définitive immédiate */
  confirmDeletion: (operationId: string) => void

  /** Vérifie si un élément est en attente de suppression */
  isPendingDeletion: (id: string) => boolean

  /** Annule toutes les opérations en attente */
  undoAll: () => void
}

/**
 * Hook pour gérer les opérations Undo/Annuler
 *
 * Pattern:
 * 1. Action "suppression" → Soft delete (marquage)
 * 2. Affichage toast avec timer (10 secondes)
 * 3. Si "Annuler" → Restauration immédiate
 * 4. Si expiration → Hard delete (suppression réelle)
 */
export function useUndo<T = unknown>(options: UseUndoOptions = {}): UseUndoReturn<T> {
  const { undoDuration = 10000, onHardDelete, onRestore } = options

  const [pendingOperations, setPendingOperations] = useState<UndoableOperation<T>[]>([])
  const operationsRef = useRef<Map<string, UndoableOperation<T>>>(new Map())

  /**
   * Marque un élément pour suppression
   */
  const markForDeletion = useCallback(
    (
      id: string,
      data: T,
      restore: () => void,
      hardDelete: () => void
    ): string => {
      const operationId = `undo-${id}-${Date.now()}`

      // Créer le timer pour la suppression définitive
      const timerId = setTimeout(() => {
        const operation = operationsRef.current.get(operationId)
        if (operation) {
          operation.hardDelete()
          operationsRef.current.delete(operationId)
          setPendingOperations((prev) => prev.filter((op) => op.id !== operationId))
          onHardDelete?.(id)
        }
      }, undoDuration)

      const operation: UndoableOperation<T> = {
        id: operationId,
        data,
        timestamp: Date.now(),
        restore,
        hardDelete,
        timerId,
      }

      operationsRef.current.set(operationId, operation)
      setPendingOperations((prev) => [...prev, operation])

      return operationId
    },
    [undoDuration, onHardDelete]
  )

  /**
   * Annule une opération (restaure l'élément)
   */
  const undoOperation = useCallback(
    (operationId: string) => {
      const operation = operationsRef.current.get(operationId)
      if (operation) {
        // Annuler le timer
        if (operation.timerId) {
          clearTimeout(operation.timerId)
        }

        // Restaurer l'élément
        operation.restore()

        // Nettoyer
        operationsRef.current.delete(operationId)
        setPendingOperations((prev) => prev.filter((op) => op.id !== operationId))

        // Extraire l'ID original de l'operationId
        const originalId = operationId.replace(/^undo-/, '').replace(/-\d+$/, '')
        onRestore?.(originalId)
      }
    },
    [onRestore]
  )

  /**
   * Force la suppression définitive immédiate
   */
  const confirmDeletion = useCallback(
    (operationId: string) => {
      const operation = operationsRef.current.get(operationId)
      if (operation) {
        // Annuler le timer
        if (operation.timerId) {
          clearTimeout(operation.timerId)
        }

        // Supprimer définitivement
        operation.hardDelete()

        // Nettoyer
        operationsRef.current.delete(operationId)
        setPendingOperations((prev) => prev.filter((op) => op.id !== operationId))

        const originalId = operationId.replace(/^undo-/, '').replace(/-\d+$/, '')
        onHardDelete?.(originalId)
      }
    },
    [onHardDelete]
  )

  /**
   * Vérifie si un élément est en attente de suppression
   */
  const isPendingDeletion = useCallback((id: string): boolean => {
    return pendingOperations.some((op) => op.id.includes(id))
  }, [pendingOperations])

  /**
   * Annule toutes les opérations en attente
   */
  const undoAll = useCallback(() => {
    operationsRef.current.forEach((operation) => {
      if (operation.timerId) {
        clearTimeout(operation.timerId)
      }
      operation.restore()
    })
    operationsRef.current.clear()
    setPendingOperations([])
  }, [])

  return {
    pendingOperations,
    markForDeletion,
    undoOperation,
    confirmDeletion,
    isPendingDeletion,
    undoAll,
  }
}

/**
 * Hook simplifié pour une utilisation avec useToast
 * Combine useUndo et useToast pour une expérience fluide
 */
export function useUndoWithToast<T = unknown>(
  toast: {
    undo: (title: string, onUndo: () => void, message?: string) => string
  },
  options: UseUndoOptions = {}
) {
  const undoManager = useUndo<T>(options)

  /**
   * Supprime un élément avec toast Undo automatique
   */
  const deleteWithUndo = useCallback(
    (
      id: string,
      data: T,
      displayName: string,
      onRestore: () => void,
      onHardDelete: () => void
    ) => {
      const operationId = undoManager.markForDeletion(id, data, onRestore, onHardDelete)

      // Afficher le toast avec le bouton Annuler
      toast.undo(`${displayName} supprimé`, () => {
        undoManager.undoOperation(operationId)
      })

      return operationId
    },
    [undoManager, toast]
  )

  return {
    ...undoManager,
    deleteWithUndo,
  }
}
