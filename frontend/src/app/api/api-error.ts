import { HttpErrorResponse } from '@angular/common/http';

// Transforme une erreur HTTP en message lisible par l'utilisateur.
export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Une erreur inattendue est survenue.';
  }
  // 0 : la requête n'a jamais atteint le serveur (réseau coupé).
  // 502, 503, 504 : le proxy de développement n'arrive pas à joindre l'API (serveur arrêté).
  if ([0, 502, 503, 504].includes(error.status)) {
    return "Le serveur est injoignable. Vérifiez que l'API est lancée.";
  }
  // Notre API renvoie { message: '...' } ou { message: ['...', '...'] }.
  const message: unknown = error.error?.message;
  if (Array.isArray(message)) {
    return message.join(' ');
  }
  if (typeof message === 'string') {
    return message;
  }
  return 'Le serveur a rencontré un problème (erreur ' + error.status + ').';
}
