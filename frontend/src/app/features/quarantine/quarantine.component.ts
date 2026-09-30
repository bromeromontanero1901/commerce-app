import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { QuarantineRecord } from '../../core/models/commerce.model';
import { CommerceApiService } from '../../core/services/commerce-api.service';

@Component({
  selector: 'app-quarantine',
  standalone: true,
  imports: [DatePipe],
  template: `
    <h1>Registros con errores</h1>
    <div class="bar">
      <span class="muted">{{ items().length }} registros en cuarentena</span>
      <button (click)="load()" [disabled]="loading()">Actualizar</button>
    </div>

    @if (error()) { <p class="alert error" role="alert">{{ error() }}</p> }
    @if (loading()) { <p class="muted">Cargando…</p> }
    @else if (!items().length && !error()) { <p class="muted">No hay registros con errores. Procesa una fecha para validarlos.</p> }
    @else if (items().length) {
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Código</th><th>Comercio</th><th>Documento</th><th>Fecha proceso</th><th>Motivo</th>
          </tr></thead>
          <tbody>
            @for (r of items(); track r.id) {
              <tr>
                <td>{{ r.pcCodComercio }}</td>
                <td [class.empty]="!r.pcNomComRed">{{ r.pcNomComRed || 'vacío' }}</td>
                <td [class.empty]="!r.pcNumDoc">{{ r.pcNumDoc || 'vacío' }}</td>
                <td>{{ r.pcProcessDate | date: 'yyyy-MM-dd' }}</td>
                <td class="motivo">{{ r.motivo }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `
})
export class QuarantineComponent implements OnInit {
  private readonly api = inject(CommerceApiService);

  readonly items = signal<QuarantineRecord[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set('');
    this.api.getQuarantine().subscribe({
      next: r => { this.items.set(r); this.loading.set(false); },
      error: (e: Error) => { this.error.set(e.message); this.loading.set(false); }
    });
  }
}
