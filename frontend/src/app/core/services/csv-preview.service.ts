import { Injectable } from '@angular/core';
import { CSV_COLUMNS, CommerceRow } from '../models/commerce.model';

export interface CsvPreview { rows: CommerceRow[]; errors: string[]; }

/** Lee y valida el CSV en el navegador para previsualizarlo antes de enviarlo al back. */
@Injectable({ providedIn: 'root' })
export class CsvPreviewService {
  private readonly fileNameRegex = /^commerce_(\d{2})(\d{2})(\d{4})\.csv$/i;

  validateFileName(name: string): string | null {
    const m = this.fileNameRegex.exec(name);
    if (!m) return 'El nombre debe ser commerce_DDMMYYYY.csv.';
    const [d, mo, y] = [+m[1], +m[2], +m[3]];
    const date = new Date(y, mo - 1, d);
    const valid = date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
    return valid ? null : 'La fecha del nombre del archivo no es válida.';
  }

  async parse(file: File): Promise<CsvPreview> {
    const text = (await file.text()).replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return { rows: [], errors: ['El archivo está vacío.'] };

    const header = this.splitLine(lines[0]).map(h => h.trim().toLowerCase());
    const missing = CSV_COLUMNS.filter(c => !header.includes(c));
    if (missing.length) return { rows: [], errors: [`Faltan columnas: ${missing.join(', ')}.`] };
    if (lines.length === 1) return { rows: [], errors: ['El archivo no contiene registros.'] };

    const errors: string[] = [];
    const rows = lines.slice(1).map((line, i) => {
      const cells = this.splitLine(line);
      if (cells.length !== header.length) errors.push(`Línea ${i + 2}: se esperaban ${header.length} columnas y hay ${cells.length}.`);
      const row = {} as CommerceRow;
      for (const col of CSV_COLUMNS) row[col] = (cells[header.indexOf(col)] ?? '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.pc_processdate))
        errors.push(`Línea ${i + 2}: pc_processdate debe tener formato yyyy-MM-dd.`);
      return row;
    });
    return { rows, errors };
  }

  /** Divide una línea CSV respetando comillas dobles. */
  private splitLine(line: string): string[] {
    const out: string[] = [];
    let cur = '', quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted;
      } else if (ch === ',' && !quoted) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  }
}
