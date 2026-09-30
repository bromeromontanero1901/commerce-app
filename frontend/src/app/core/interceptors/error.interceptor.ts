import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/** Traduce cualquier error HTTP a un mensaje legible para el usuario. */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message =
        err.status === 0 ? 'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.'
        : err.error?.detail ?? 'Ocurrió un error inesperado.';
      return throwError(() => new Error(message));
    })
  );
