import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'upload' },
  { path: 'upload', loadComponent: () => import('./features/upload/upload.component').then(m => m.UploadComponent) },
  { path: 'process', loadComponent: () => import('./features/process/process.component').then(m => m.ProcessComponent) },
  { path: 'quarantine', loadComponent: () => import('./features/quarantine/quarantine.component').then(m => m.QuarantineComponent) },
  { path: '**', redirectTo: 'upload' }
];
