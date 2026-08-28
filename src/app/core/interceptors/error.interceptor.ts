import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { AuthService } from '../services/auth.service';

// Permite a una llamada concreta pedir que NO se muestre el toast genérico
// (porque el propio componente va a mostrar el error inline, p.ej. en un formulario).
export const SUPPRESS_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 en cualquier petición autenticada: la sesión ya no es válida.
      if (error.status === 401 && auth.isAuthenticated()) {
        auth.logout();
        toast.show({ type: 'error', message: 'Tu sesión ha caducado. Inicia sesión de nuevo.' });
        return throwError(() => error);
      }

      // El backend siempre responde { message } en texto comprensible
      // (sección 61 del backend); si por lo que sea no viene, usamos un
      // mensaje genérico en vez de mostrar detalles técnicos.
      const message =
        (typeof error.error?.message === 'string' && error.error.message) ||
        'Ha ocurrido un problema. Inténtalo de nuevo en unos segundos.';

      // Los errores de validación de formularios se muestran inline en el
      // propio formulario (el componente que llama decide eso); aquí solo
      // mostramos un toast para errores que no se gestionan localmente.
      if (!req.context.get(SUPPRESS_ERROR_TOAST)) {
        toast.show({ type: 'error', message });
      }

      return throwError(() => error);
    }),
  );
};
