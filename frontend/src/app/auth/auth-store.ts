import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { firstValueFrom, of, switchMap, tap, timer } from 'rxjs';
import { LoginResponse } from '../models/auth';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

const STORAGE_KEY = 'equipe.session';

// L'utilisateur connecté et son jeton, partagés par toute l'application.
@Service()
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  constructor() {
    this.observ.subscribe();
  }

  // Confort d'affichage uniquement : c'est le serveur qui vérifie les droits.
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  // null : personne n'est connecté. Au démarrage, on relit la session sauvegardée.
  private readonly session = signal<LoginResponse | null>(readSession());
  private readonly observ = toObservable(this.session).pipe(
    switchMap((session) => {
      if (session === null) {
        return of(false);
      } else {
        return timer(
          Math.max(0, new Date(session.expiresAt).getTime() - new Date().getTime()),
        ).pipe(
          tap(() => {
            this.clear();
            this.router.navigate(['/connexion'], { queryParams: { expiree: '1' } });
          }),
        );
      }
    }),
  );

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);

  // Rejette la Promise avec une HttpErrorResponse (401) si les identifiants sont faux.
  async login(email: string, password: string): Promise<void> {
    // firstValueFrom : transforme l'Observable de HttpClient en Promise, pour utiliser await.
    const response = await firstValueFrom(
      this.http.post<LoginResponse>('/api/login', { email, password }),
    );
    this.session.set(response);
    saveSession(response);
  }

  logout(): void {
    if (this.token()) {
      // Le serveur oublie le jeton. On n'attend pas sa réponse, et on ignore une erreur.
      this.http.post('/api/logout', {}).subscribe({ error: () => undefined });
    }
    this.clear();
  }

  // Fin de session sans prévenir le serveur (il a déjà refusé le jeton).
  clear(): void {
    this.session.set(null);
    saveSession(null);
  }
}

function readSession(): LoginResponse | null {
  try {
    const stored = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? 'null',
    ) as LoginResponse | null;
    // Un jeton expiré ne sert à rien : on l'oublie.
    if (stored && new Date(stored.expiresAt).getTime() > Date.now()) {
      return stored;
    }
  } catch {
    // Contenu illisible ou stockage indisponible : pas de session.
  }
  return null;
}

function saveSession(session: LoginResponse | null): void {
  try {
    if (session) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Stockage indisponible (navigation privée stricte) : la session reste en mémoire.
  }
}
