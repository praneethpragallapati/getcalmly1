/**
 * Minimal, dependency-free CSV builder for admin exports (statements, revenue
 * ledgers). Excel-compatible: values are quoted and internal quotes doubled, and
 * a UTF-8 BOM is prepended so Excel reads unicode (₹, names) correctly.
 */
export type CsvValue = string | number | boolean | null | undefined

function cell(v: CsvValue): string {
  if (v == null) return ''
  const s = String(v)
  // Always quote: keeps commas, quotes, newlines and leading-zero codes intact.
  return `"${s.replace(/"/g, '""')}"`
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))]
  return '﻿' + lines.join('\r\n') + '\r\n'
}

/** A Response that downloads as a .csv file. */
export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
