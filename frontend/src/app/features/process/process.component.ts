import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommerceApiService } from '../../core/services/commerce-api.service';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Procesar registros</h1>
    <p class="hint">Valida los comercios cargados con la fecha elegida (<code>pc_processdate</code>). Los que tengan errores pasan a cuarentena.</p>

    <div class="bar">
      <label for="date">Fecha de proceso</label>
      <input id="date" type="date" [formControl]="date" />
      <button class="primary" (click)="run()" [disabled]="date.invalid || loading()">
        {{ loading() ? 'Procesando…' : 'Procesar' }}
      </button>
    </div>

    @if (error()) { <p class="alert error" role="alert">{{ error() }}</p> }
    @if (result() !== null) {
      <p class="alert ok" role="status">
        {{ result() }} {{ result() === 1 ? 'registro enviado' : 'registros enviados' }} a cuarentena.
        @if (result()! > 0) { <a routerLink="/quarantine">Ver detalle</a> }
      </p>
    }
  `
})
export class ProcessComponent {
  private readonly api = inject(CommerceApiService);

  readonly date = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  readonly loading = signal(false);
  readonly result = signal<number | null>(null);
  readonly error = signal('');

  run(): void {
    this.loading.set(true); this.error.set(''); this.result.set(null);
    this.api.process(this.date.value).subscribe({
      next: r => { this.result.set(r.quarantined); this.loading.set(false); },
      error: (e: Error) => { this.error.set(e.message); this.loading.set(false); }
    });
  }
}
