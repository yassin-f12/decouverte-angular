import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { filter, interval, map, Observable, of, Subscription, take } from 'rxjs';

const TIPS = [
  "Lisez toujours le message d'erreur en entier.",
  'Un signal se lit avec des parenthèses.',
  "Vérifiez l'onglet Réseau avant d'accuser le code.",
];

// Une Promise qui se termine (resolve) après ms millisecondes.
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simule un appel serveur lent qui échoue une fois sur trois.
async function fetchTip(): Promise<string> {
  await wait(1500);
  if (Math.random() < 0.33) {
    throw new Error('Le serveur ne répond pas.');
  }
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}

@Component({
  imports: [MatButton, DatePipe],
  selector: 'app-labo',
  styleUrl: './labo.css',
  templateUrl: './labo.html',
})
export class Labo {
  // Module 1 : l'ordre d'exécution.
  protected readonly logs = signal<string[]>([]);

  protected runTimeout(): void {
    this.logs.set([]);
    this.log('1. Avant setTimeout');
    setTimeout(() => this.log('3. Dans setTimeout, une seconde plus tard'), 1000);
    this.log('2. Après setTimeout');
  }

  private log(message: string): void {
    this.logs.update((list) => [...list, message]);
  }

  // Module 2 : une Promise et async/await.
  protected readonly loading = signal(false);
  protected readonly tip = signal('');

  protected async loadTip(): Promise<void> {
    this.loading.set(true);
    this.tip.set('');
    try {
      // await : la méthode se met en pause ici, sans bloquer la page.
      const text = await fetchTip();
      this.tip.set(text);
    } catch (error) {
      this.tip.set('Erreur : ' + (error as Error).message);
    } finally {
      // finally : exécuté dans tous les cas, succès ou erreur.
      this.loading.set(false);
    }
  }

  // Module 3 : un Observable et son abonnement.
  protected readonly seconds = signal(0);
  protected readonly running = signal(false);
  private chronoSubscription?: Subscription;
  private readonly destroyRef = inject(DestroyRef);

  protected startChrono(): void {
    this.running.set(true);

    // subscribe : on s'abonne, le flux démarre. Il renvoie un "abonnement".
    this.chronoSubscription = interval(1000)
      // takeUntilDestroyed : désabonnement automatique quand on quitte la page.
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        console.log('tic', value);
        this.seconds.set(value + 1);
      });
  }

  // Module 4 : un Observable transformé en signal. Pas de subscribe, pas d'unsubscribe.
  protected readonly now = toSignal(interval(1000).pipe(map(() => new Date())), {
    initialValue: new Date(),
  });

  protected stopChrono(): void {
    // unsubscribe : on se désabonne, le flux s'arrête.
    this.chronoSubscription?.unsubscribe();
    this.running.set(false);
  }

  protected runOperators(): void {
    this.logs.set([]);
    of(1, 2, 3, 4, 5, 6)
      .pipe(
        filter((n) => n % 2 === 0), // garde 2, 4, 6
        map((n) => n * 10), // les transforme en 20, 40, 60
      )
      .subscribe({
        next: (n) => this.log('Valeur reçue : ' + n),
        complete: () => this.log('Terminé'),
      });
  }

  // défis de la phase 1
  protected readonly goCofee = signal(false);
  protected readonly countdown = signal(10);
  protected readonly msgFinal = signal("C'est l'heure de la pause !");

  protected startChronoCofee(): void {
    this.countdown.set(9);
    this.goCofee.set(true);

    interval(1000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(9),
        map((n) => 8 - n),
      )
      .subscribe({
        next: (n) => this.countdown.set(n),
        complete: () => this.goCofee.set(false),
      });
  }

  // niveau avancé du défi 1 partie 1
  protected readonly performance = signal(0);
  protected readonly performance2 = signal(0);

  protected async perfo(): Promise<void> {
    const debut = performance.now();
    await wait(1000);
    await wait(1000);
    const fin = performance.now();

    this.performance.set(Math.round(fin - debut));

    const debut2 = performance.now();
    await Promise.all([wait(1000), wait(1000)]);
    const fin2 = performance.now();

    this.performance2.set(Math.round(fin2 - debut2));
  }

  // niveau avancé du défi 1 partie 2 : observable
  protected readonly monObservable = new Observable<string>((subscriber) => {
    subscriber.next('Bonjour');
    const pause = setTimeout(() => {
      subscriber.next('Une seconde plus tard');
      subscriber.complete();
    }, 1000);

    return () => {
      clearTimeout(pause);
      console.log('Nettoyage');
    };
  });

  protected sub(): void {
    this.monObservable.subscribe({
      next: (message) => {
        console.log(message);
      },
      complete: () => {
        console.log("Fin du l'observable");
      },
    });
  }
}
