import { Component, inject, signal } from '@angular/core';
import { CSV_COLUMNS, CommerceRow } from '../../core/models/commerce.model';
import { CommerceApiService } from '../../core/services/commerce-api.service';
import { CsvPreviewService } from '../../core/services/csv-preview.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  template: `
    <h1>Cargar archivo</h1>
    <p class="hint">Selecciona un archivo <code>commerce_DDMMYYYY.csv</code>, revisa su contenido y luego envíalo.</p>

    <label class="dropzone">
      <input type="file" accept=".csv" (change)="onFile($event)" />
      <span>{{ file()?.name ?? 'Elegir archivo CSV' }}</span>
    </label>

    @for (e of errors(); track e) { <p class="alert error" role="alert">{{ e }}</p> }
    @if (message()) { <p class="alert ok" role="status">{{ message() }}</p> }

    @if (rows().length) {
      <div class="bar">
        <strong>{{ rows().length }} registros</strong>
        <span class="muted">Se muestran los primeros {{ preview().length }}</span>
        <button class="primary" (click)="send()" [disabled]="loading() || errors().length > 0">
          {{ loading() ? 'Enviando…' : 'Enviar al servidor' }}
        </button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>@for (c of columns; track c) { <th>{{ c }}</th> }</tr></thead>
          <tbody>
            @for (r of preview(); track $index) {
              <tr>@for (c of columns; track c) { <td [class.empty]="!r[c]">{{ r[c] || 'vacío' }}</td> }</tr>
            }
          </tbody>
        </table>
      </div>
    }
  `
})
export class UploadComponent {
  private readonly api = inject(CommerceApiService);
  private readonly csv = inject(CsvPreviewService);

  readonly columns = CSV_COLUMNS;
  readonly file = signal<File | null>(null);
  readonly rows = signal<CommerceRow[]>([]);
  readonly preview = signal<CommerceRow[]>([]);
  readonly errors = signal<string[]>([]);
  readonly message = signal('');
  readonly loading = signal(false);

  async onFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.reset();
    if (!file) return;
    this.file.set(file);

    const nameError = this.csv.validateFileName(file.name);
    if (nameError) { this.errors.set([nameError]); return; }

    const result = await this.csv.parse(file);
    this.errors.set(result.errors.slice(0, 5));
    this.rows.set(result.rows);
    this.preview.set(result.rows.slice(0, 50));
  }

  send(): void {
    const file = this.file();
    if (!file) return;
    this.loading.set(true);
    this.api.upload(file).subscribe({
      next: r => { this.message.set(`${r.inserted} registros cargados desde ${r.fileName}.`); this.loading.set(false); },
      error: (e: Error) => { this.errors.set([e.message]); this.loading.set(false); }
    });
  }

  private reset(): void {
    this.file.set(null); this.rows.set([]); this.preview.set([]);
    this.errors.set([]); this.message.set('');
  }
}
