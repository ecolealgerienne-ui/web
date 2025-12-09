/**
 * Utilitaires d'export de rapports (CSV, Excel, PDF)
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  ReportType,
  HerdInventoryReport,
  TreatmentsReport,
  VaccinationsReport,
  GrowthReport,
  MovementsReport,
} from '@/lib/services/reports.service';

// Types pour l'export
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

interface ExportOptions {
  filename: string;
  title: string;
  period?: { from: string; to: string };
  farmName?: string;
}

// ============================================
// CSV Export
// ============================================

/**
 * Exporte des données en CSV
 */
export function exportToCSV(
  headers: string[],
  rows: (string | number)[][],
  filename: string
): void {
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// ============================================
// Excel Export
// ============================================

/**
 * Exporte des données en Excel
 */
export function exportToExcel(
  headers: string[],
  rows: (string | number)[][],
  options: ExportOptions
): void {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Ajuster la largeur des colonnes
  const colWidths = headers.map((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...rows.map(row => String(row[i] ?? '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, options.title.slice(0, 31));

  XLSX.writeFile(workbook, `${options.filename}.xlsx`);
}

// ============================================
// PDF Export
// ============================================

/**
 * Exporte des données en PDF
 */
export function exportToPDF(
  headers: string[],
  rows: (string | number)[][],
  options: ExportOptions
): void {
  const doc = new jsPDF({
    orientation: headers.length > 6 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // En-tête du document
  doc.setFontSize(18);
  doc.text(options.title, 14, 20);

  // Informations sur la période
  doc.setFontSize(10);
  doc.setTextColor(100);

  let yPos = 28;
  if (options.farmName) {
    doc.text(`Ferme: ${options.farmName}`, 14, yPos);
    yPos += 6;
  }
  if (options.period) {
    doc.text(
      `Période: ${formatDate(options.period.from)} - ${formatDate(options.period.to)}`,
      14,
      yPos
    );
    yPos += 6;
  }
  doc.text(`Généré le: ${formatDate(new Date().toISOString())}`, 14, yPos);

  // Tableau
  autoTable(doc, {
    head: [headers],
    body: rows.map(row => row.map(cell => cell ?? '-')),
    startY: yPos + 8,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
  });

  // Pied de page avec numéro de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} / ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`${options.filename}.pdf`);
}

// ============================================
// Fonctions spécifiques par type de rapport
// ============================================

/**
 * Export du rapport Inventaire Cheptel
 */
export function exportHerdInventory(
  data: HerdInventoryReport,
  format: ExportFormat,
  t: (key: string) => string,
  options: Partial<ExportOptions> = {}
): void {
  const headers = [
    t('columns.visualId'),
    t('columns.officialNumber'),
    t('columns.species'),
    t('columns.breed'),
    t('columns.sex'),
    t('columns.birthDate'),
    t('columns.age'),
    t('columns.status'),
    t('columns.lot'),
    t('columns.weight'),
  ];

  const rows = (data?.details || []).map(animal => [
    animal.visualId || '-',
    animal.officialNumber || '-',
    animal.species,
    animal.breed,
    animal.sex,
    formatDate(animal.birthDate),
    animal.age,
    animal.status,
    animal.lotName || '-',
    animal.currentWeight ? `${animal.currentWeight} kg` : '-',
  ]);

  const exportOptions: ExportOptions = {
    filename: options.filename || `inventaire_cheptel_${getDateSuffix()}`,
    title: t('definitions.herd-inventory.name'),
    period: options.period,
    farmName: options.farmName,
  };

  switch (format) {
    case 'csv':
      exportToCSV(headers, rows, exportOptions.filename);
      break;
    case 'xlsx':
      exportToExcel(headers, rows, exportOptions);
      break;
    case 'pdf':
      exportToPDF(headers, rows, exportOptions);
      break;
  }
}

/**
 * Export du rapport Traitements
 */
export function exportTreatmentsReport(
  data: TreatmentsReport,
  format: ExportFormat,
  t: (key: string) => string,
  options: Partial<ExportOptions> = {}
): void {
  const headers = [
    t('columns.date'),
    t('columns.visualId'),
    t('columns.type'),
    t('columns.product'),
    t('columns.dosage'),
    t('columns.veterinarian'),
    t('columns.withdrawalDate'),
    t('columns.status'),
  ];

  const rows = (data?.details || []).map(treatment => [
    formatDate(treatment.date),
    treatment.visualId || '-',
    treatment.type,
    treatment.productName,
    treatment.dosage || '-',
    treatment.veterinarian || '-',
    treatment.withdrawalEndDate ? formatDate(treatment.withdrawalEndDate) : '-',
    treatment.status,
  ]);

  const exportOptions: ExportOptions = {
    filename: options.filename || `traitements_${getDateSuffix()}`,
    title: t('definitions.treatments-report.name'),
    period: options.period,
    farmName: options.farmName,
  };

  switch (format) {
    case 'csv':
      exportToCSV(headers, rows, exportOptions.filename);
      break;
    case 'xlsx':
      exportToExcel(headers, rows, exportOptions);
      break;
    case 'pdf':
      exportToPDF(headers, rows, exportOptions);
      break;
  }
}

/**
 * Export du rapport Vaccinations
 */
export function exportVaccinationsReport(
  data: VaccinationsReport,
  format: ExportFormat,
  t: (key: string) => string,
  options: Partial<ExportOptions> = {}
): void {
  const headers = [
    t('columns.date'),
    t('columns.visualId'),
    t('columns.product'),
    t('columns.batchNumber'),
    t('columns.veterinarian'),
    t('columns.nextDueDate'),
  ];

  const rows = (data?.details || []).map(vaccination => [
    formatDate(vaccination.date),
    vaccination.visualId || '-',
    vaccination.productName,
    vaccination.batchNumber || '-',
    vaccination.veterinarian || '-',
    vaccination.nextDueDate ? formatDate(vaccination.nextDueDate) : '-',
  ]);

  const exportOptions: ExportOptions = {
    filename: options.filename || `vaccinations_${getDateSuffix()}`,
    title: t('definitions.vaccinations-report.name'),
    period: options.period,
    farmName: options.farmName,
  };

  switch (format) {
    case 'csv':
      exportToCSV(headers, rows, exportOptions.filename);
      break;
    case 'xlsx':
      exportToExcel(headers, rows, exportOptions);
      break;
    case 'pdf':
      exportToPDF(headers, rows, exportOptions);
      break;
  }
}

/**
 * Export du rapport Croissance
 */
export function exportGrowthReport(
  data: GrowthReport,
  format: ExportFormat,
  t: (key: string) => string,
  options: Partial<ExportOptions> = {}
): void {
  // Export des données par lot
  const headers = [
    t('columns.lot'),
    t('columns.animalCount'),
    t('columns.avgWeight'),
    t('columns.avgDailyGain'),
    t('columns.gmqStatus'),
  ];

  const rows = (data?.byLot || []).map(lot => [
    lot.lotName,
    lot.animalCount,
    `${lot.avgWeight.toFixed(1)} kg`,
    `${lot.avgDailyGain.toFixed(2)} kg/j`,
    t(`gmqStatus.${lot.gmqStatus}`),
  ]);

  const exportOptions: ExportOptions = {
    filename: options.filename || `croissance_${getDateSuffix()}`,
    title: t('definitions.growth-report.name'),
    period: options.period,
    farmName: options.farmName,
  };

  switch (format) {
    case 'csv':
      exportToCSV(headers, rows, exportOptions.filename);
      break;
    case 'xlsx':
      exportToExcel(headers, rows, exportOptions);
      break;
    case 'pdf':
      exportToPDF(headers, rows, exportOptions);
      break;
  }
}

/**
 * Export du rapport Mouvements
 */
export function exportMovementsReport(
  data: MovementsReport,
  format: ExportFormat,
  t: (key: string) => string,
  options: Partial<ExportOptions> = {}
): void {
  const headers = [
    t('columns.date'),
    t('columns.type'),
    t('columns.visualId'),
    t('columns.source'),
    t('columns.destination'),
    t('columns.reason'),
  ];

  const rows = (data?.details || []).map(movement => [
    formatDate(movement.date),
    movement.type,
    movement.visualId || '-',
    movement.source || '-',
    movement.destination || '-',
    movement.reason || '-',
  ]);

  const exportOptions: ExportOptions = {
    filename: options.filename || `mouvements_${getDateSuffix()}`,
    title: t('definitions.movements-report.name'),
    period: options.period,
    farmName: options.farmName,
  };

  switch (format) {
    case 'csv':
      exportToCSV(headers, rows, exportOptions.filename);
      break;
    case 'xlsx':
      exportToExcel(headers, rows, exportOptions);
      break;
    case 'pdf':
      exportToPDF(headers, rows, exportOptions);
      break;
  }
}

// ============================================
// Helpers
// ============================================

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
}

function getDateSuffix(): string {
  return new Date().toISOString().split('T')[0];
}
