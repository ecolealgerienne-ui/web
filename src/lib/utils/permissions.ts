/**
 * Utilitaires pour la gestion des permissions utilisateur
 */

import { User } from '@/lib/types/user'

/**
 * Vérifie si l'utilisateur est super admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'super_admin'
}

/**
 * Vérifie si l'utilisateur est au moins admin (admin ou super_admin)
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'super_admin'
}

/**
 * Vérifie si l'utilisateur peut accéder aux fonctionnalités d'administration
 */
export function canAccessAdmin(user: User | null): boolean {
  return isSuperAdmin(user)
}

/**
 * Vérifie si l'utilisateur peut modifier les données de référence
 */
export function canManageReferenceData(user: User | null): boolean {
  return isSuperAdmin(user)
}

/**
 * Vérifie si l'utilisateur peut gérer les utilisateurs
 */
export function canManageUsers(user: User | null): boolean {
  return isSuperAdmin(user)
}

/**
 * Vérifie si l'utilisateur peut voir les données (lecture uniquement)
 */
export function canViewData(user: User | null): boolean {
  return user !== null // Tous les utilisateurs authentifiés peuvent voir
}

/**
 * Vérifie si l'utilisateur peut modifier les données opérationnelles
 */
export function canEditData(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'user'
}
