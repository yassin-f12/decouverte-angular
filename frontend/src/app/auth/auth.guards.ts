import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth-store';

// Pages réservées aux utilisateurs connectés.
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  // Pas connecté : direction la connexion, en retenant la page demandée.
  return router.createUrlTree(['/connexion'], {
    queryParams: { retour: state.url },
  });
};
// Pages réservées aux administrateurs RH.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/acces-refuse']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }
  return true;
};
