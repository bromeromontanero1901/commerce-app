import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header>
      <span class="brand">Comercios</span>
      <nav>
        <a routerLink="/upload" routerLinkActive="active">Cargar</a>
        <a routerLink="/process" routerLinkActive="active">Procesar</a>
        <a routerLink="/quarantine" routerLinkActive="active">Errores</a>
      </nav>
    </header>
    <main><router-outlet /></main>
  `
})
export class AppComponent {}
