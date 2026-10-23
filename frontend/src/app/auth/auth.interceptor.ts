import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from './auth-store';

// Appelé pour CHAQUE requête HttpClient (et httpResource) de l'application.
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const token = auth.token();

  // Le jeton part uniquement vers notre API, jamais vers un autre site.
  const authRequest =
    token && request.url.startsWith('/api/')
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      // 401 alors qu'on avait un jeton : il a expiré, ou le serveur a redémarré.
      if (error instanceof HttpErrorResponse && error.status === 401 && auth.token()) {
        auth.clear();
        void router.navigate(['/connexion'], {
          queryParams: { expiree: 1, retour: router.url },
        });
      }
      // On relance l'erreur : le composant qui a fait la requête peut aussi la traiter.
      return throwError(() => error);
    }),
  );
};
