/**
 * Alert Templates Management Page
 *
 * Admin page for managing alert template catalog (global reference data)
 */

'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { AlertTemplateFormDialog } from '@/components/admin/alert-templates/AlertTemplateFormDialog'
import { useAlertTemplates } from '@/lib/hooks/admin/useAlertTemplates'
import { useToast } from '@/lib/hooks/useToast'
import type { AlertTemplate, AlertTemplateFilterParams } from '@/lib/types/admin/alert-template'
import type { AlertTemplateFormData } from '@/lib/validation/schemas/admin/alert-template.schema'
import { Edit2, Trash2 } from 'lucide-react'

interface ColumnDef<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export default function AlertTemplatesPage() {
  const t = useTranslations('alertTemplate')
  const tc = useTranslations('common')
  const { success, error: showError } = useToast()

  // State for filtering and pagination
  const [params, setParams] = useState<AlertTemplateFilterParams>({
    page: 1,
    limit: 20,
    orderBy: 'code',
    order: 'ASC',
  })

  // Fetch data with custom hook
  const { data, total, loading, create, update, delete: deleteTemplate } = useAlertTemplates(params)

  // State for modals and sheets
  const [formOpen, setFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AlertTemplate | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<AlertTemplate | null>(null)
  const [detailTemplate, setDetailTemplate] = useState<AlertTemplate | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [operationLoading, setOperationLoading] = useState(false)

  // DataTable columns configuration
  const columns: ColumnDef<AlertTemplate>[] = useMemo(
    () => [
      {
        key: 'code',
        header: t('fields.code'),
        sortable: true,
        render: (template: AlertTemplate) => (
          <span className="font-mono text-sm">{template.code}</span>
        ),
      },
      {
        key: 'nameFr',
        header: t('fields.nameFr'),
        sortable: true,
      },
      {
        key: 'category',
        header: t('fields.category'),
        sortable: true,
        render: (template: AlertTemplate) => (
          <Badge variant="default">{t(`categories.${template.category}`)}</Badge>
        ),
      },
      {
        key: 'priority',
        header: t('fields.priority'),
        sortable: true,
        render: (template: AlertTemplate) => {
          const priorityColors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800',
          }
          return (
            <Badge className={priorityColors[template.priority]}>
              {t(`priorities.${template.priority}`)}
            </Badge>
          )
        },
      },
      {
        key: 'isActive',
        header: tc('fields.isActive'),
        render: (template: AlertTemplate) =>
          template.isActive ? (
            <Badge variant="success">✓ {tc('status.active')}</Badge>
          ) : (
            <Badge variant="default">○ {tc('status.inactive')}</Badge>
          ),
      },
    ],
    [t, tc]
  )

  // Handlers
  const handleCreate = () => {
    setEditingTemplate(null)
    setFormOpen(true)
  }

  const handleEdit = (template: AlertTemplate) => {
    setEditingTemplate(template)
    setFormOpen(true)
  }

  const handleDeleteClick = (template: AlertTemplate) => {
    setDeletingTemplate(template)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTemplate) return

    try {
      setOperationLoading(true)
      await deleteTemplate(deletingTemplate.id)
      success(t('messages.deleted'))
      setDeleteDialogOpen(false)
      setDeletingTemplate(null)
    } catch (error: any) {
      showError(t('messages.deleteError'), error.message)
    } finally {
      setOperationLoading(false)
    }
  }

  const handleFormSubmit = async (data: AlertTemplateFormData) => {
    try {
      setOperationLoading(true)

      if (editingTemplate) {
        // Update existing template
        await update(editingTemplate.id, {
          ...data,
          version: editingTemplate.version || 1,
        })
        success(t('messages.updated'))
      } else {
        // Create new template
        await create(data)
        success(t('messages.created'))
      }

      setFormOpen(false)
      setEditingTemplate(null)
    } catch (error: any) {
      showError(
        editingTemplate ? t('messages.updateError') : t('messages.createError'),
        error.message
      )
    } finally {
      setOperationLoading(false)
    }
  }

  const handleRowClick = (template: AlertTemplate) => {
    setDetailTemplate(template)
    setDetailSheetOpen(true)
  }

  // Detail fields for the DetailSheet
  const detailFields = useMemo(
    () => [
      {
        key: 'code',
        label: t('fields.code'),
        render: (value: string) => <span className="font-mono">{value}</span>,
      },
      {
        key: 'nameFr',
        label: t('fields.nameFr'),
      },
      {
        key: 'nameEn',
        label: t('fields.nameEn'),
      },
      {
        key: 'nameAr',
        label: t('fields.nameAr'),
        render: (value: string) => <span dir="rtl">{value}</span>,
      },
      {
        key: 'category',
        label: t('fields.category'),
        render: (value: string) => (
          <Badge variant="default">{t(`categories.${value}`)}</Badge>
        ),
      },
      {
        key: 'priority',
        label: t('fields.priority'),
        render: (value: string) => (
          <Badge>{t(`priorities.${value}`)}</Badge>
        ),
      },
      {
        key: 'description',
        label: t('fields.description'),
        render: (value: string) => value || '-',
      },
      {
        key: 'messageTemplateFr',
        label: t('fields.messageTemplateFr'),
        render: (value: string) => value || '-',
      },
      {
        key: 'messageTemplateEn',
        label: t('fields.messageTemplateEn'),
        render: (value: string) => value || '-',
      },
      {
        key: 'messageTemplateAr',
        label: t('fields.messageTemplateAr'),
        render: (value: string) => (value ? <span dir="rtl">{value}</span> : '-'),
      },
      {
        key: 'isActive',
        label: tc('fields.isActive'),
        render: (value: boolean) =>
          value ? (
            <Badge variant="success">{tc('status.active')}</Badge>
          ) : (
            <Badge variant="default">{tc('status.inactive')}</Badge>
          ),
      },
      {
        key: 'createdAt',
        label: tc('fields.createdAt'),
        render: (value: string) =>
          new Date(value).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
      {
        key: 'updatedAt',
        label: tc('fields.updatedAt'),
        render: (value: string) =>
          new Date(value).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
    ],
    [t, tc]
  )

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('title.plural')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      {/* DataTable générique (RÈGLE #3) */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<AlertTemplate>
            data={data}
            columns={columns}
            totalItems={total}
            page={params.page || 1}
            limit={params.limit || 20}
            onPageChange={(page) => setParams({ ...params, page })}
            onLimitChange={(limit) => setParams({ ...params, limit, page: 1 })}
            sortBy={params.orderBy}
            sortOrder={params.order?.toLowerCase() as 'asc' | 'desc' | undefined}
            onSortChange={(sortBy, sortOrder) =>
              setParams({
                ...params,
                orderBy: sortBy as any,
                order: sortOrder?.toUpperCase() as 'ASC' | 'DESC' | undefined
              })
            }
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            loading={loading}
            emptyMessage={t('messages.noResults')}
            searchPlaceholder={t('search.placeholder')}
          />
        </CardContent>
      </Card>

      {/* Formulaire de création/édition */}
      <AlertTemplateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        template={editingTemplate}
        onSubmit={handleFormSubmit}
        loading={operationLoading}
      />

      {/* Modale de confirmation de suppression */}
      <DeleteConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={deletingTemplate?.nameFr || ''}
        loading={operationLoading}
      />

      {/* Sheet de détail */}
      {detailTemplate && (
        <DetailSheet<AlertTemplate>
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          title={detailTemplate.nameFr}
          item={detailTemplate}
          fields={detailFields}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDetailSheetOpen(false)
                  handleEdit(detailTemplate)
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                {tc('actions.edit')}
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setDetailSheetOpen(false)
                  handleDeleteClick(detailTemplate)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {tc('actions.delete')}
              </Button>
            </div>
          }
        />
      )}
    </div>
  )
}
