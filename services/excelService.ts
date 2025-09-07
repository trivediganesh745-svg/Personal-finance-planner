import type { Sheet } from '../types';

// This function relies on the SheetJS library being loaded globally via CDN.
// The global variable is `XLSX`.
declare const XLSX: any;

export const exportDataToExcel = (sheetsData: Sheet[], fileName: string): void => {
  try {
    if (typeof XLSX === 'undefined') {
      console.error('SheetJS library (XLSX) not found. Make sure it is loaded.');
      alert('Error: Could not generate Excel file. The required library is missing.');
      return;
    }

    const wb = XLSX.utils.book_new();

    sheetsData.forEach(sheet => {
      // Auto-adjust column widths
      const ws = XLSX.utils.aoa_to_sheet(sheet.data);
      const cols = sheet.data[0]?.map((_, i) => ({
        wch: sheet.data.reduce((w, r) => Math.max(w, String(r[i] ?? '').length), 10)
      }));
      ws['!cols'] = cols;
      XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
    });

    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Failed to export data to Excel:', error);
    alert('An unexpected error occurred while generating the Excel file.');
  }
};
