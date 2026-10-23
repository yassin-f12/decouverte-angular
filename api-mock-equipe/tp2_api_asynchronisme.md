# TP 2 bonus - API, RxJS et sécurité pas à pas

**Durée indicative** : 6 h à 7 h, à votre rythme (23 modules de 15 à 25 minutes), sur deux après-midis
**Prérequis** : TP 1 bonus terminé (application **TechCorp Équipe** fonctionnelle jusqu'au module 21)
**Livrable** : TechCorp Équipe branchée sur une vraie API : connexion, pages protégées, annuaire avec recherche, fiche, ajout, modification et suppression de collègues, demandes de congé. `ng build` passe sans erreur.

---

## Pourquoi ce TP

Les jours 3, 4 et 5 enchaînent beaucoup de notions nouvelles : l'asynchronisme, les Observables, HttpClient, les intercepteurs, les guards, les jetons. Ce TP les reprend **une à la fois**, dans le petit projet du TP 1 bonus que vous connaissez déjà.

Ce que vous allez apprendre :

- **L'asynchronisme** : ce qui se passe quand le code doit attendre (un minuteur, un serveur).
- **RxJS, simplement** : ce qu'est un Observable, comment s'y abonner, et surtout comment le **transformer en signal**.
- **Consommer une API** : lire, créer, modifier, supprimer des données sur un serveur.
- **La sécurité côté front** : se connecter, envoyer un jeton, protéger des pages, réagir à une session expirée.

Chaque module suit le même plan que le TP 1 bonus : **La notion**, **Pas à pas**, **Vérifier**. Tapez le code, lisez les commentaires, et vérifiez le résultat **à chaque module**.

## Choisir son niveau

| Niveau            | Ce que vous faites                                                                 | Pour qui                                    |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| **Débutant**      | Tous les modules "Pas à pas", dans l'ordre                                         | Les jours 4 et 5 vous ont semblé difficiles |
| **Intermédiaire** | Les modules, puis le **défi intermédiaire** de chaque phase (indices fournis)      | Les modules vous semblent faciles           |
| **Avancé**        | Les modules en lecture rapide, puis le **défi avancé** de chaque phase (sans aide) | Vous êtes à l'aise avec le TP 1 bonus       |

## Plan du TP

| Phase                                   | Modules  | Ce que vous construisez                                             |
| --------------------------------------- | -------- | ------------------------------------------------------------------- |
| 1. L'asynchronisme                      | 1 à 4    | Une page "Labo" : minuteur, chargement simulé, chronomètre, horloge |
| 2. Consommer une API                    | 5 à 8    | Les services de l'entreprise chargés depuis le serveur              |
| 3. Authentification et routes protégées | 9 à 15   | Connexion, jeton, pages réservées, rôles, session expirée           |
| 4. Le CRUD des collègues                | 16 à 21  | Annuaire, recherche, fiche, ajout, modification, suppression        |
| 5. Les congés                           | 22 et 23 | Mes demandes de congé : liste, nouvelle demande, annulation         |

### Le vocabulaire en un coup d'oeil

| Mot               | Ce que c'est                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| **Asynchrone**    | Une opération dont le résultat arrive **plus tard** (minuteur, réponse d'un serveur)              |
| **Promise**       | Une promesse de **une** valeur future. On l'attend avec `await`                                   |
| **Observable**    | Un **flux** de valeurs dans le temps (zéro, une ou plusieurs). On s'y **abonne** avec `subscribe` |
| **Opérateur**     | Une fonction RxJS qui transforme un flux : `map`, `filter`, `debounceTime`...                     |
| **API REST**      | Un serveur qui répond à des requêtes HTTP (`GET`, `POST`, `PUT`, `DELETE`) avec du JSON           |
| **Jeton** (token) | Une chaîne secrète remise à la connexion, à renvoyer à chaque requête pour prouver qui on est     |
| **Intercepteur**  | Une fonction appelée pour **chaque** requête HTTP de l'application                                |
| **Guard**         | Une fonction qui autorise ou refuse l'accès à une route                                           |

---

## Avant de commencer (10 min)

1. **Votre projet** : ouvrez votre projet `decouverte-angular` du TP 1 bonus dans VS Code. S'il est incomplet ou ne démarre pas, demandez au formateur la correction du TP 1 bonus et repartez de celle-ci (`npm install` puis `npm start`).
2. **La fausse API** : récupérez le dossier `api-mock-equipe` fourni par le formateur et placez-le **à côté** de votre projet :

```text
~/cda/
  decouverte-angular/     votre application Angular
  api-mock-equipe/        la fausse API
```

3. Vérifiez que votre projet démarre (`npm start`) et que `ng build` passe, avant de modifier quoi que ce soit.
4. Faites un commit : `git add .` puis `git commit -m "Fin du TP 1 bonus"`. Vous pourrez toujours revenir à ce point.

---

# Phase 1 - L'asynchronisme

Cette phase se passe **sans serveur**, dans une page d'expérimentation : le "Labo".

## Module 1 - Synchrone et asynchrone (15 min)

### La notion

Le code JavaScript s'exécute **ligne après ligne** : c'est le fonctionnement **synchrone**. Mais certaines opérations prennent du temps : attendre une seconde, attendre la réponse d'un serveur. Si le navigateur restait bloqué pendant ce temps, la page serait gelée.

Ces opérations sont donc **asynchrones** : on les lance, le code **continue** sans attendre, et une fonction (appelée **callback**) est exécutée plus tard, quand le résultat est prêt.

```ts
console.log("A");
setTimeout(() => console.log("C"), 1000); // "dans une seconde, affiche C"
console.log("B");
// Affiche A, B... puis C une seconde plus tard.
```

### Pas à pas

1. Générez la page :

```bash
ng generate component pages/labo
```

2. `src/app/pages/labo/labo.ts` :

```ts
import { Component, signal } from "@angular/core";
import { MatButton } from "@angular/material/button";

@Component({
  imports: [MatButton],
  selector: "app-labo",
  styleUrl: "./labo.css",
  templateUrl: "./labo.html",
})
export class Labo {
  // Module 1 : l'ordre d'exécution.
  protected readonly logs = signal<string[]>([]);

  protected runTimeout(): void {
    this.logs.set([]);
    this.log("1. Avant setTimeout");
    setTimeout(
      () => this.log("3. Dans setTimeout, une seconde plus tard"),
      1000,
    );
    this.log("2. Après setTimeout");
  }

  private log(message: string): void {
    this.logs.update((list) => [...list, message]);
  }
}
```

3. `src/app/pages/labo/labo.html` :

```html
<h1>Laboratoire de l'asynchronisme</h1>

<section aria-labelledby="order-title">
  <h2 id="order-title">1. L'ordre d'exécution</h2>
  <div class="actions">
    <button matButton="outlined" type="button" (click)="runTimeout()">
      Lancer setTimeout
    </button>
  </div>
  <ol class="logs" aria-live="polite">
    @for (line of logs(); track $index) {
    <li>{{ line }}</li>
    }
  </ol>
</section>
```

4. `src/app/pages/labo/labo.css` :

```css
section {
  margin-top: 2rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.logs {
  min-height: 3rem;
  font-family: ui-monospace, monospace;
}
```

5. Ajoutez la route dans `src/app/app.routes.ts`, **avant** la route `**` :

```ts
import { Labo } from "./pages/labo/labo";
```

```ts
  { path: 'labo', title: 'Laboratoire | TechCorp Équipe', component: Labo },
```

6. Ajoutez le lien dans la navigation de `src/app/app.html`, après "Ajouter" :

```html
<a
  matButton
  routerLink="/labo"
  routerLinkActive="active"
  ariaCurrentWhenActive="page"
  >Labo</a
>
```

### Vérifier

- Sur `/labo`, cliquez sur "Lancer setTimeout" : les lignes 1 et 2 apparaissent **immédiatement**, la ligne 3 une seconde plus tard.
- Le code de la ligne 2 est écrit **après** `setTimeout`, et pourtant il s'exécute **avant** la ligne 3 : `setTimeout` n'attend pas, il programme une action pour plus tard.
- Pendant la seconde d'attente, la page reste utilisable : rien n'est bloqué.

---

## Module 2 - Promise et async / await (20 min)

### La notion

Une **Promise** représente une valeur qui arrivera plus tard : "je te promets une réponse". Elle finit dans un de ces deux états :

- **résolue** (`resolve`) : la valeur est arrivée ;
- **rejetée** (`reject`) : une erreur s'est produite.

Les mots-clés `async` et `await` permettent d'écrire du code asynchrone **comme s'il était synchrone** :

```ts
async function charger() {
  const valeur = await unePromise; // la fonction se met en pause ici, sans bloquer la page
  console.log(valeur); // exécuté quand la Promise est résolue
}
```

Une Promise rejetée lève une erreur à l'endroit du `await` : on l'attrape avec `try` / `catch`.

### Pas à pas

1. Dans `labo.ts`, ajoutez **au-dessus** de `@Component` une liste de conseils et deux fonctions :

```ts
const TIPS = [
  "Lisez toujours le message d'erreur en entier.",
  "Un signal se lit avec des parenthèses.",
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
    throw new Error("Le serveur ne répond pas.");
  }
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}
```

2. Dans la classe `Labo`, sous `logs`, ajoutez deux signals et une méthode :

```ts
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
```

3. Dans `labo.html`, ajoutez une section :

```html
<section aria-labelledby="promise-title">
  <h2 id="promise-title">2. Une Promise avec async / await</h2>
  <button
    matButton="filled"
    type="button"
    [disabled]="loading()"
    (click)="loadTip()"
  >
    Conseil du jour
  </button>
  <!-- aria-busy : le lecteur d'ecran sait que la zone est en cours de mise a jour. -->
  <p aria-live="polite" [attr.aria-busy]="loading()">
    @if (loading()) { Chargement... } @else { {{ tip() }} }
  </p>
</section>
```

Ce trio **chargement / succès / erreur** est le schéma de base de tout appel à un serveur. Vous le retrouverez dans chaque module de ce TP.

### Vérifier

- Cliquez sur "Conseil du jour" : "Chargement..." s'affiche pendant 1,5 seconde, le bouton est grisé (impossible de lancer deux chargements à la fois), puis un conseil apparaît.
- Cliquez plusieurs fois : de temps en temps, "Erreur : Le serveur ne répond pas." s'affiche. Le bouton redevient cliquable dans les deux cas, grâce à `finally`.
- Supprimez temporairement le mot `await` devant `fetchTip()` : le terminal signale une erreur de type (`Promise<string>` n'est pas un `string`). Sans `await`, on obtient la **promesse**, pas la valeur. Remettez-le.

---

## Module 3 - Premier Observable : le chronomètre (20 min)

### La notion

Une Promise donne **une seule** valeur. Un **Observable** (bibliothèque **RxJS**, installée avec Angular) est un **flux** : il peut émettre **plusieurs valeurs** dans le temps, puis éventuellement se terminer.

|                   | Promise                      | Observable                                           |
| ----------------- | ---------------------------- | ---------------------------------------------------- |
| Nombre de valeurs | Une                          | Zéro, une ou plusieurs                               |
| Démarrage         | Tout de suite, à la création | Seulement quand quelqu'un s'**abonne** (`subscribe`) |
| Arrêt             | Impossible                   | `unsubscribe()`                                      |

`interval(1000)` crée un Observable qui émet 0, 1, 2, 3... toutes les secondes, **sans fin**. Si on ne se désabonne pas, il continue même quand on a quitté la page : c'est une **fuite mémoire**.

### Pas à pas

1. Dans `labo.ts`, les imports deviennent :

```ts
import { Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatButton } from "@angular/material/button";
import { Subscription, interval } from "rxjs";
```

2. Dans la classe, ajoutez :

```ts
  // Module 3 : un Observable et son abonnement.
  protected readonly seconds = signal(0);
  protected readonly running = signal(false);
  private chronoSubscription?: Subscription;

  protected startChrono(): void {
    this.running.set(true);
    // subscribe : on s'abonne, le flux démarre. Il renvoie un "abonnement".
    this.chronoSubscription = interval(1000).subscribe((value) => {
      console.log('tic', value);
      this.seconds.set(value + 1);
    });
  }

  protected stopChrono(): void {
    // unsubscribe : on se désabonne, le flux s'arrête.
    this.chronoSubscription?.unsubscribe();
    this.running.set(false);
  }
```

3. Dans `labo.html`, ajoutez une section :

```html
<section aria-labelledby="chrono-title">
  <h2 id="chrono-title">3. Un Observable : le chronomètre</h2>
  <p>Secondes écoulées : {{ seconds() }}</p>
  <div class="actions">
    <button
      matButton="filled"
      type="button"
      [disabled]="running()"
      (click)="startChrono()"
    >
      Démarrer
    </button>
    <button
      matButton="outlined"
      type="button"
      [disabled]="!running()"
      (click)="stopChrono()"
    >
      Arrêter
    </button>
  </div>
</section>
```

4. **Observez la fuite** : ouvrez la console (`F12`), démarrez le chronomètre, puis allez sur la page "Accueil" **sans l'arrêter**. Les "tic" continuent dans la console : l'abonnement est toujours actif alors que la page n'existe plus.
5. **Corrigez la fuite** : en haut de la classe, demandez à Angular un `DestroyRef` (il sait quand le composant est détruit) :

```ts
  private readonly destroyRef = inject(DestroyRef);
```

Puis, dans `startChrono()`, ajoutez un `pipe` avant le `subscribe` :

```ts
this.chronoSubscription = interval(1000)
  // takeUntilDestroyed : désabonnement automatique quand on quitte la page.
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe((value) => {
    console.log("tic", value);
    this.seconds.set(value + 1);
  });
```

### Vérifier

- "Démarrer" lance le compteur, "Arrêter" le fige. Redémarrez : il repart de 1, car c'est un **nouvel** abonnement.
- Démarrez puis quittez la page : les "tic" s'arrêtent dans la console. Revenez sur `/labo` : le compteur est revenu à 0, le composant a été recréé.
- Retenez la règle : **un `subscribe` sur un flux sans fin doit toujours avoir une fin** (`unsubscribe` ou `takeUntilDestroyed`).

---

## Module 4 - Les opérateurs et `toSignal` (20 min)

### La notion

Un **opérateur** transforme un flux, comme un tuyau qui filtre ou modifie ce qui passe dedans. On les enchaîne dans `pipe(...)` :

```text
of(1, 2, 3, 4, 5, 6)  ->  filter(pair)  ->  2, 4, 6  ->  map(x 10)  ->  20, 40, 60
```

| Opérateur | Rôle                                                | Équivalent sur un tableau |
| --------- | --------------------------------------------------- | ------------------------- |
| `map`     | Transforme chaque valeur                            | `tableau.map(...)`        |
| `filter`  | Ne garde que certaines valeurs                      | `tableau.filter(...)`     |
| `take(n)` | Garde les n premières valeurs, puis termine le flux | `tableau.slice(0, n)`     |

Dans Angular moderne, on affiche des **signals**. `toSignal(observable)` fait le pont : il s'abonne à l'Observable, met la dernière valeur dans un signal, et **se désabonne tout seul** quand le composant est détruit. Plus de `subscribe`, plus de fuite.

### Pas à pas

1. Dans `labo.ts`, les imports deviennent :

```ts
import { DatePipe } from "@angular/common";
import { Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { MatButton } from "@angular/material/button";
import { Subscription, filter, interval, map, of } from "rxjs";
```

Ajoutez `DatePipe` au tableau `imports` du composant : `imports: [DatePipe, MatButton],`.

2. Dans la classe, ajoutez une méthode qui enchaîne deux opérateurs :

```ts
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
```

`of(...)` émet ses valeurs puis se **termine** : `complete` est alors appelé. Pas besoin de se désabonner d'un flux qui se termine.

3. Sous les signals du module 3, ajoutez une horloge :

```ts
  // Module 4 : un Observable transformé en signal. Pas de subscribe, pas d'unsubscribe.
  protected readonly now = toSignal(interval(1000).pipe(map(() => new Date())), {
    initialValue: new Date(),
  });
```

`initialValue` : la valeur du signal **avant** la première émission (sinon il vaudrait `undefined` pendant une seconde).

4. Dans `labo.html`, ajoutez un second bouton dans la section 1, à côté de "Lancer setTimeout" :

```html
<button matButton="outlined" type="button" (click)="runOperators()">
  Lancer of + pipe
</button>
```

Puis une dernière section :

```html
<section aria-labelledby="clock-title">
  <h2 id="clock-title">4. Un Observable dans un signal : l'horloge</h2>
  <p>Il est {{ now() | date: 'HH:mm:ss' }}</p>
</section>
```

### Vérifier

- "Lancer of + pipe" affiche 20, 40, 60 puis "Terminé" : seules les valeurs paires sont passées, multipliées par 10.
- L'horloge avance chaque seconde, sans aucun `subscribe` dans votre code.
- Résumez dans votre tête les trois outils de la phase :

| Outil             | Quand l'utiliser                                                 |
| ----------------- | ---------------------------------------------------------------- |
| `async` / `await` | Attendre **une** réponse, puis continuer (envoyer un formulaire) |
| `subscribe`       | Réagir à **chaque** valeur d'un flux (sans oublier de l'arrêter) |
| `toSignal`        | **Afficher** les valeurs d'un flux dans un template              |

---

## Défis de la phase 1

### Intermédiaire

Ajoutez un compte à rebours "Pause café dans 9 s... 8 s..." qui démarre au clic, puis affiche "C'est l'heure de la pause !" à la fin.

Indices : `interval(1000).pipe(take(10), map((n) => 9 - n))`, un signal `countdown`, et le callback `complete` de `subscribe` pour le message final. N'oubliez pas `takeUntilDestroyed`.

### Avancé

1. Mesurez avec `performance.now()` la durée de deux `await wait(1000)` à la suite, puis de `await Promise.all([wait(1000), wait(1000)])`. Affichez les deux durées et expliquez la différence.
2. Créez un Observable **à la main** avec `new Observable<string>((subscriber) => { ... })` : il émet "Bonjour", puis "Une seconde plus tard" après une seconde, puis se termine. La fonction renvoyée par le constructeur (fonction de nettoyage) affiche "Nettoyage". Dans quel ordre s'affichent les messages ? Que se passe-t-il si vous n'appelez jamais `subscribe` ?

---

# Phase 2 - Consommer une API

## Module 5 - Lancer l'API et la relier à Angular (20 min)

### La notion

Une **API REST** est un serveur qui répond à des requêtes HTTP avec des données JSON :

| Méthode  | Adresse             | Action                      |
| -------- | ------------------- | --------------------------- |
| `GET`    | `/api/employees`    | Lire la liste des collègues |
| `GET`    | `/api/employees/12` | Lire le collègue 12         |
| `POST`   | `/api/employees`    | Créer un collègue           |
| `PUT`    | `/api/employees/12` | Remplacer le collègue 12    |
| `DELETE` | `/api/employees/12` | Supprimer le collègue 12    |

Le formateur fournit une **fausse API** (`api-mock-equipe`) qui se comporte comme une vraie : elle répond avec un délai de 500 ms, demande une connexion pour la plupart des routes, et refuse certaines actions selon votre rôle.

L'API tourne sur le port 3000, Angular sur le port 4200. Pour que le navigateur n'y voie qu'**un seul site**, on configure un **proxy** : le serveur de développement d'Angular transmet toutes les requêtes `/api/...` au port 3000.

### Pas à pas

1. Dans un **nouveau terminal** Git Bash, lancez l'API et **laissez-la tourner** pendant tout le TP :

```bash
cd ~/cda/api-mock-equipe
npm install
npm start
```

Le terminal affiche l'adresse de l'API et les comptes de démonstration.

2. Explorez l'API dans le navigateur :
   - http://localhost:3000/api/departments : la liste des 5 services, en JSON. Cette route est **publique**.
   - http://localhost:3000/api/employees : `{ "message": "Authentification requise." }`. Cette route est **protégée** : il faudra se connecter (phase 3).

3. À la racine de votre projet Angular (à côté de `package.json`), créez `proxy.conf.json` :

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

4. Dans `angular.json`, cherchez la section `"serve"` et ajoutez un bloc `"options"` juste sous la ligne `"builder"` :

```json
        "serve": {
          "builder": "@angular/build:dev-server",
          "options": {
            "proxyConfig": "proxy.conf.json"
          },
          "configurations": {
```

5. Rendez `HttpClient` disponible dans toute l'application. Dans `src/app/app.config.ts` :

```ts
import { provideHttpClient } from "@angular/common/http";
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
  ],
};
```

6. **Arrêtez** le serveur Angular (`Ctrl + C`) et relancez `npm start` : le proxy n'est lu qu'au démarrage.

### Vérifier

- http://localhost:4200/api/departments affiche la même liste que http://localhost:3000/api/departments : le proxy fonctionne.
- Dans le terminal de l'API, chaque requête apparaît avec son statut (`GET /api/departments 200`).
- Vous avez maintenant **deux terminaux** qui tournent : l'API et Angular. Gardez-en un troisième pour les commandes `ng generate`.

---

## Module 6 - Premier appel HTTP : un service et `subscribe` (20 min)

### La notion

`HttpClient` est le service d'Angular pour parler à une API. Ses méthodes (`get`, `post`, `put`, `delete`) renvoient un **Observable** :

- la requête **ne part pas** tant que personne ne s'abonne ;
- l'Observable émet **une seule** valeur (la réponse), puis se **termine** : pas de fuite possible.

Bonne pratique : les composants n'appellent pas `HttpClient` directement. Un **service** regroupe les appels à une ressource de l'API.

### Pas à pas

1. Créez l'interface d'un service de l'entreprise :

```bash
ng generate interface models/department
```

`src/app/models/department.ts` :

```ts
// Un service de l'entreprise, tel que renvoyé par GET /api/departments.
export interface Department {
  id: number;
  name: string;
  floor: number;
}
```

2. Créez le service d'accès à l'API :

```bash
ng generate service api/department-api
```

`src/app/api/department-api.ts` :

```ts
import { HttpClient } from "@angular/common/http";
import { Service, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { Department } from "../models/department";

@Service()
export class DepartmentApi {
  private readonly http = inject(HttpClient);

  // Renvoie un Observable : AUCUNE requête ne part tant que personne ne s'abonne.
  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>("/api/departments");
  }

  // map transforme la réponse : [{ id, name, floor }, ...] devient ['Informatique', ...].
  getNames(): Observable<string[]> {
    return this.getAll().pipe(
      map((departments) => departments.map((d) => d.name)),
    );
  }
}
```

`get<Department[]>` : on indique à TypeScript la forme de la réponse. Attention, c'est une **promesse de forme**, pas une vérification : si le serveur renvoie autre chose, TypeScript ne le saura pas.

3. Le formulaire d'ajout contient une liste de services **écrite en dur**. Chargez-la depuis l'API. Dans `src/app/pages/add-employee/add-employee.ts` :
   - importez le service : `import { DepartmentApi } from '../../api/department-api';` ;
   - remplacez la ligne `protected readonly departments = ['Informatique', ...];` par :

```ts
  private readonly departmentApi = inject(DepartmentApi);

  // Vide au départ, remplie quand la réponse arrive.
  protected readonly departments = signal<string[]>([]);

  constructor() {
    // subscribe : la requête part maintenant. Le callback reçoit la réponse.
    this.departmentApi.getNames().subscribe((names) => this.departments.set(names));
  }
```

4. Dans `add-employee.html`, `departments` est maintenant un signal : lisez-le avec des parenthèses.

```html
@for (department of departments(); track department) {
```

### Vérifier

- Ouvrez l'onglet **Réseau** (Network) des DevTools, filtre "Fetch/XHR", puis allez sur "Ajouter" : une requête `departments` apparaît. Cliquez dessus, onglet "Réponse" (Response) : le JSON du serveur.
- La liste "Service" contient maintenant **5** services (Marketing et Finance en plus).
- **Expérience** : mettez la ligne `this.departmentApi.getNames()...` en commentaire et rechargez la page "Ajouter". Plus aucune requête dans l'onglet Réseau : sans `subscribe`, l'Observable ne fait **rien**. Retirez le commentaire.

---

## Module 7 - L'Observable devient un signal avec `toSignal` (15 min)

### La notion

Le module 6 utilise trois étapes : un signal vide, un `subscribe`, un `set`. `toSignal` (module 4) fait exactement la même chose en une ligne, et gère le désabonnement.

### Pas à pas

1. Dans `add-employee.ts`, ajoutez l'import :

```ts
import { toSignal } from "@angular/core/rxjs-interop";
```

2. Remplacez le signal `departments` **et** le `constructor` par :

```ts
  // La liste des services vient de l'API : Observable -> signal.
  protected readonly departments = toSignal(this.departmentApi.getNames(), { initialValue: [] });
```

Le template ne change pas : `departments()` reste un signal.

### Vérifier

- La liste des services fonctionne exactement comme avant, avec 6 lignes de moins.
- L'onglet Réseau montre toujours **une** requête à chaque arrivée sur la page "Ajouter".
- Retenez le chemin le plus courant dans Angular moderne : **HttpClient renvoie un Observable, `toSignal` le transforme en signal, le template affiche le signal.**

---

## Module 8 - Chargement, erreur, réessayer avec `httpResource` (20 min)

### La notion

Un vrai écran doit gérer trois situations : **en cours de chargement**, **erreur**, **données reçues**. Avec `toSignal`, il faudrait les coder à la main. `httpResource` le fait pour vous : il lance un `GET` et expose le résultat sous forme de signals.

| Signal ou méthode | Signification                                             |
| ----------------- | --------------------------------------------------------- |
| `isLoading()`     | La requête est en cours                                   |
| `error()`         | L'erreur, si la requête a échoué                          |
| `hasValue()`      | Une réponse est disponible                                |
| `value()`         | La réponse (à lire seulement si `hasValue()` vaut `true`) |
| `reload()`        | Relance la requête                                        |

**À retenir pour la suite** : `httpResource` sert à **lire** des données (`GET`). Pour **agir** (créer, modifier, supprimer), on utilise `HttpClient`.

### Pas à pas

1. Dans `src/app/pages/home/home.ts`, ajoutez les imports et une ressource :

```ts
import { httpResource } from "@angular/common/http";
import { Department } from "../../models/department";
```

```ts
  // La requête part toute seule. Le résultat et l'état du chargement sont des signals.
  protected readonly departments = httpResource<Department[]>(() => '/api/departments');
```

2. À la fin de `src/app/pages/home/home.html`, ajoutez :

```html
<section aria-labelledby="departments-title">
  <h2 id="departments-title">Nos services</h2>

  <!-- Une seule zone annoncee au lecteur d'ecran : l'etat du chargement. -->
  <p aria-live="polite">
    @if (departments.isLoading()) { Chargement des services... } @else if
    (departments.error()) { Impossible de charger les services. } @else if
    (departments.hasValue()) { {{ departments.value().length }} services }
  </p>

  @if (departments.error()) {
  <button matButton="outlined" type="button" (click)="departments.reload()">
    Réessayer
  </button>
  } @if (departments.hasValue()) {
  <ul>
    @for (department of departments.value(); track department.id) {
    <li>{{ department.name }}, étage {{ department.floor }}</li>
    }
  </ul>
  }
</section>
```

Pourquoi un seul paragraphe `aria-live` ? Si toute la liste était dans une zone annoncée, le lecteur d'écran lirait chaque élément à voix haute à chaque chargement. On annonce seulement l'**état**.

### Vérifier

- Rechargez l'accueil : "Chargement des services..." pendant une demi-seconde, puis "5 services" et la liste.
- **Simulez une panne** : arrêtez l'API (`Ctrl + C` dans son terminal) et rechargez l'accueil. "Impossible de charger les services." et le bouton "Réessayer" apparaissent.
- Relancez l'API (`npm start`), puis cliquez sur "Réessayer" : la liste revient, sans recharger la page.
- Comparez les trois façons de lire des données vues dans cette phase :

| Façon          | Code                         | Chargement et erreur                           |
| -------------- | ---------------------------- | ---------------------------------------------- |
| `subscribe`    | Signal + `subscribe` + `set` | À coder à la main                              |
| `toSignal`     | Une ligne                    | À coder à la main                              |
| `httpResource` | Une ligne                    | Fournis : `isLoading()`, `error()`, `reload()` |

---

## Défis de la phase 2

### Intermédiaire

1. Sur l'accueil, affichez les services **triés par étage**.
2. Dans le formulaire d'ajout, tant que la liste des services n'est pas arrivée, désactivez la liste déroulante et affichez "Chargement des services...".

Indices :

- un `computed` qui lit `this.departments.value()` (après avoir vérifié `hasValue()`) et renvoie `[...liste].sort((a, b) => a.floor - b.floor)`. Pourquoi faut-il une copie avant `sort` ?
- sans `initialValue`, `toSignal` vaut `undefined` tant que la réponse n'est pas arrivée ;
- avec les Signal Forms, un champ se désactive dans le schéma : `disabled(path.department, () => ...)`, et pas avec `[disabled]` dans le template.

### Avancé

Rendez `getNames()` robuste : en cas d'échec, l'Observable **réessaie deux fois**, puis renvoie une liste de secours `['Informatique']` au lieu d'une erreur. Utilisez uniquement des opérateurs RxJS. Testez en arrêtant l'API : combien de requêtes voyez-vous dans l'onglet Réseau ?

---

# Phase 3 - Authentification et routes protégées

## Comment fonctionne la connexion

```text
1. Connexion     POST /api/login { email, password }   ->  { token, user }
2. Mémorisation  le front garde le jeton (dans un signal)
3. Requêtes      GET /api/employees
                 Authorization: Bearer 3f9a...c41    ->  200 et les données
4. Sans jeton    GET /api/employees                  ->  401 Authentification requise
5. Mauvais rôle  DELETE /api/employees/5 (employé)   ->  403 Action réservée...
```

Le **jeton** est comme un badge d'entreprise : remis une fois à l'accueil (connexion), présenté à chaque porte (requête). Le serveur vérifie le badge **à chaque fois**.

Comptes de démonstration (mot de passe `TechCorp2026!`) :

| E-mail                       | Rôle                         |
| ---------------------------- | ---------------------------- |
| `claire.martin@techcorp.fr`  | Employée (`employee`)        |
| `julien.bernard@techcorp.fr` | Employé (`employee`)         |
| `sarah.lefevre@techcorp.fr`  | Administratrice RH (`admin`) |

## Module 9 - Le service d'authentification (20 min)

### La notion

L'utilisateur connecté et son jeton doivent être accessibles **partout** : dans l'en-tête, dans les guards, dans l'intercepteur. On les range dans un service, `AuthStore`, avec des **signals** (comme le `TeamStore` du TP 1 bonus).

Pour la connexion, on veut **attendre** la réponse du serveur avant de continuer. `HttpClient` renvoie un Observable ; `firstValueFrom(observable)` le transforme en **Promise**, qu'on peut attendre avec `await` (module 2).

### Pas à pas

1. Créez les modèles :

```bash
ng generate interface models/auth
```

`src/app/models/auth.ts` :

```ts
// Les deux rôles reconnus par l'API.
export type Role = "employee" | "admin";

// L'utilisateur connecté, tel que renvoyé par l'API.
export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

// Réponse de POST /api/login.
export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}
```

2. Créez le service :

```bash
ng generate service auth/auth-store
```

`src/app/auth/auth-store.ts` :

```ts
import { HttpClient } from "@angular/common/http";
import { Service, computed, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { LoginResponse } from "../models/auth";

// L'utilisateur connecté et son jeton, partagés par toute l'application.
@Service()
export class AuthStore {
  private readonly http = inject(HttpClient);

  // null : personne n'est connecté.
  private readonly session = signal<LoginResponse | null>(null);

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);

  // Rejette la Promise avec une HttpErrorResponse (401) si les identifiants sont faux.
  async login(email: string, password: string): Promise<void> {
    // firstValueFrom : transforme l'Observable de HttpClient en Promise, pour utiliser await.
    const response = await firstValueFrom(
      this.http.post<LoginResponse>("/api/login", { email, password }),
    );
    this.session.set(response);
  }

  logout(): void {
    this.session.set(null);
  }
}
```

`?.` et `??` : si `session()` vaut `null`, `this.session()?.user` vaut `undefined` au lieu de provoquer une erreur, et `?? null` le remplace par `null`.

3. Affichez l'état de la connexion dans l'en-tête. Dans `src/app/app.ts`, importez `inject` et `AuthStore`, puis ajoutez dans la classe :

```ts
  protected readonly auth = inject(AuthStore);
```

Dans `src/app/app.html`, ajoutez **après** la balise `</nav>` (toujours dans `<mat-toolbar>`) :

```html
<div class="session">
  @if (auth.user(); as user) {
  <span>{{ user.firstName }} {{ user.lastName }}</span>
  } @else {
  <span>Non connecté</span>
  }
</div>
```

`@if (auth.user(); as user)` : si l'utilisateur existe, il est disponible sous le nom `user` dans le bloc.

Dans `src/app/app.css`, ajoutez :

```css
nav,
.session {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
```

4. **Testez sans formulaire** (la page de connexion arrive au module 10). Dans `labo.ts`, importez `AuthStore` et ajoutez dans la classe :

```ts
  protected readonly auth = inject(AuthStore);
```

Dans `labo.html`, tout en haut, sous le `<h1>` :

```html
<!-- Bouton de test provisoire, supprime au module 10. -->
<button
  type="button"
  (click)="auth.login('claire.martin@techcorp.fr', 'TechCorp2026!')"
>
  Test de connexion
</button>
```

### Vérifier

- L'en-tête affiche "Non connecté".
- Sur `/labo`, cliquez sur "Test de connexion" : une demi-seconde plus tard, l'en-tête affiche "Claire Martin".
- Onglet Réseau : la requête `login` est un `POST`. Onglet "Charge utile" (Payload) : l'e-mail et le mot de passe envoyés. Onglet "Réponse" : le `token`, sa date d'expiration et l'utilisateur.
- Rechargez la page (`F5`) : "Non connecté". Le jeton n'était qu'en mémoire (corrigé au module 13).

---

## Module 10 - La page de connexion (25 min)

### La notion

Le formulaire de connexion réutilise les **Signal Forms** du TP 1 bonus, avec une nouveauté : l'action de soumission est **asynchrone**. Elle attend la réponse du serveur, qui peut être un succès ou une erreur.

Pendant l'attente, `loginForm().submitting()` vaut `true` : on s'en sert pour désactiver le bouton et éviter un double envoi.

Côté sécurité, le message d'erreur reste **vague** ("Adresse e-mail ou mot de passe incorrect.") : dire "cet e-mail n'existe pas" aiderait un attaquant à deviner les comptes existants.

### Pas à pas

1. Supprimez le bouton "Test de connexion" de `labo.html`, ainsi que `auth` et l'import d'`AuthStore` dans `labo.ts`.
2. Un petit utilitaire transforme une erreur HTTP en message lisible. Créez `src/app/api/api-error.ts` :

```ts
import { HttpErrorResponse } from "@angular/common/http";

// Transforme une erreur HTTP en message lisible par l'utilisateur.
export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return "Une erreur inattendue est survenue.";
  }
  // 0 : la requête n'a jamais atteint le serveur (réseau coupé).
  // 502, 503, 504 : le proxy de développement n'arrive pas à joindre l'API (serveur arrêté).
  if ([0, 502, 503, 504].includes(error.status)) {
    return "Le serveur est injoignable. Vérifiez que l'API est lancée.";
  }
  // Notre API renvoie { message: '...' } ou { message: ['...', '...'] }.
  const message: unknown = error.error?.message;
  if (Array.isArray(message)) {
    return message.join(" ");
  }
  if (typeof message === "string") {
    return message;
  }
  return "Le serveur a rencontré un problème (erreur " + error.status + ").";
}
```

3. Générez la page :

```bash
ng generate component pages/login
```

`src/app/pages/login/login.ts` :

```ts
import { Component, inject, signal } from "@angular/core";
import {
  FormField,
  FormRoot,
  email,
  form,
  required,
} from "@angular/forms/signals";
import { MatButton } from "@angular/material/button";
import { Router } from "@angular/router";
import { apiErrorMessage } from "../../api/api-error";
import { AuthStore } from "../../auth/auth-store";

@Component({
  imports: [FormField, FormRoot, MatButton],
  selector: "app-login",
  styleUrl: "./login.css",
  templateUrl: "./login.html",
})
export class Login {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  private readonly credentials = signal({ email: "", password: "" });

  protected readonly loginForm = form(
    this.credentials,
    (path) => {
      required(path.email, { message: "L'e-mail est obligatoire." });
      email(path.email, { message: "L'e-mail n'est pas valide." });
      required(path.password, { message: "Le mot de passe est obligatoire." });
    },
    {
      submission: {
        action: async () => this.signIn(),
      },
    },
  );

  // Erreur renvoyée par le serveur (mauvais mot de passe, serveur arrêté...).
  protected readonly serverError = signal("");

  private async signIn(): Promise<void> {
    this.serverError.set("");
    const { email, password } = this.credentials();
    try {
      // await : on attend la réponse du serveur avant de continuer.
      await this.auth.login(email, password);
    } catch (error) {
      this.serverError.set(apiErrorMessage(error));
      return;
    }
    await this.router.navigate(["/equipe"]);
  }
}
```

4. `src/app/pages/login/login.html` :

```html
<h1>Connexion</h1>

@let emailField = loginForm.email(); @let password = loginForm.password();

<form class="form" [formRoot]="loginForm">
  <div class="field">
    <label for="email">E-mail</label>
    <!-- autocomplete : le navigateur et les gestionnaires de mots de passe remplissent le champ. -->
    <input
      id="email"
      type="email"
      autocomplete="username"
      [formField]="loginForm.email"
      [attr.aria-invalid]="emailField.touched() && emailField.invalid()"
      [attr.aria-describedby]="emailField.touched() && emailField.invalid() ? 'email-error' : null"
    />
    @if (emailField.touched() && emailField.invalid()) {
    <p class="field__error" id="email-error">
      {{ emailField.errors()[0].message }}
    </p>
    }
  </div>

  <div class="field">
    <label for="password">Mot de passe</label>
    <input
      id="password"
      type="password"
      autocomplete="current-password"
      [formField]="loginForm.password"
      [attr.aria-invalid]="password.touched() && password.invalid()"
      [attr.aria-describedby]="password.touched() && password.invalid() ? 'password-error' : null"
    />
    @if (password.touched() && password.invalid()) {
    <p class="field__error" id="password-error">
      {{ password.errors()[0].message }}
    </p>
    }
  </div>

  <!-- role="alert" : le lecteur d'ecran annonce l'erreur des qu'elle apparait. -->
  @if (serverError()) {
  <p class="alert" role="alert">{{ serverError() }}</p>
  }

  <!-- submitting() vaut true pendant l'action : on evite le double envoi. -->
  <button
    matButton="filled"
    type="submit"
    [disabled]="loginForm().submitting()"
  >
    {{ loginForm().submitting() ? 'Connexion...' : 'Se connecter' }}
  </button>
</form>

<p class="hint">
  Comptes de test (mot de passe <code>TechCorp2026!</code>) :
  claire.martin@techcorp.fr (employée), sarah.lefevre@techcorp.fr
  (administratrice RH).
</p>
```

`&#64;` : le caractère `@`. Dans un template Angular, un `@` seul annonce un bloc (`@if`, `@for`) : on l'écrit donc sous forme d'entité HTML.

5. `src/app/pages/login/login.css` :

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 24rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #6b7280;
  border-radius: 0.25rem;
  font: inherit;
}

.field__error {
  margin: 0;
  color: #b91c1c;
}

[aria-invalid="true"] {
  border-color: #b91c1c;
}

.alert {
  margin: 0;
  padding: 0.75rem;
  border-left: 4px solid #b91c1c;
  background-color: #fef2f2;
  color: #7f1d1d;
}

.hint {
  margin-top: 2rem;
  color: #4b5563;
}
```

6. Ajoutez la route dans `app.routes.ts` (importez `Login`) :

```ts
  { path: 'connexion', title: 'Connexion | TechCorp Équipe', component: Login },
```

7. Dans `app.html`, remplacez `<span>Non connecté</span>` par un lien :

```html
<a matButton="filled" routerLink="/connexion">Se connecter</a>
```

### Vérifier

- "Se connecter" dans l'en-tête mène au formulaire. Envoyé vide, il affiche les deux erreurs, **sans** requête dans l'onglet Réseau : la validation se fait d'abord côté navigateur.
- Avec `claire.martin@techcorp.fr` et un mauvais mot de passe : le bouton affiche "Connexion..." pendant l'attente, puis "Adresse e-mail ou mot de passe incorrect." apparaît. Onglet Réseau : statut **401**.
- Avec le bon mot de passe : vous arrivez sur `/equipe`, l'en-tête affiche "Claire Martin".
- Arrêtez l'API et essayez de vous connecter : "Le serveur est injoignable...". Relancez l'API.

---

## Module 11 - L'intercepteur : envoyer le jeton (25 min)

### La notion

Pour accéder à une route protégée, chaque requête doit porter l'en-tête `Authorization: Bearer <jeton>`. Plutôt que de l'ajouter à la main dans chaque service, on écrit un **intercepteur** : une fonction appelée pour **toutes** les requêtes de l'application, qui peut les modifier avant leur départ.

Une requête HTTP est **immuable** : on ne la modifie pas, on en crée une copie modifiée avec `request.clone(...)`.

### Pas à pas

1. Créez une page qui lit une route protégée :

```bash
ng generate component pages/account
```

`src/app/pages/account/account.ts` :

```ts
import { httpResource } from "@angular/common/http";
import { Component } from "@angular/core";
import { AuthUser } from "../../models/auth";

@Component({
  imports: [],
  selector: "app-account",
  styleUrl: "./account.css",
  templateUrl: "./account.html",
})
export class Account {
  // GET /api/me : sans jeton, le serveur répond 401.
  protected readonly me = httpResource<AuthUser>(() => "/api/me");
}
```

`src/app/pages/account/account.html` :

```html
<h1>Mon compte</h1>

@if (me.isLoading()) {
<p>Chargement du profil...</p>
} @else if (me.error()) {
<p class="error">Impossible de charger votre profil.</p>
} @else if (me.hasValue()) {
<dl>
  <dt>Nom</dt>
  <dd>{{ me.value().firstName }} {{ me.value().lastName }}</dd>
  <dt>E-mail</dt>
  <dd>{{ me.value().email }}</dd>
  <dt>Rôle</dt>
  <dd>{{ me.value().role === 'admin' ? 'Administrateur RH' : 'Employé' }}</dd>
</dl>
}
```

`src/app/pages/account/account.css` :

```css
dt {
  font-weight: 700;
}

dd {
  margin: 0 0 0.75rem;
}

.error {
  color: #b91c1c;
}
```

Route dans `app.routes.ts` (importez `Account`) :

```ts
  { path: 'compte', title: 'Mon compte | TechCorp Équipe', component: Account },
```

2. Dans `app.html`, le nom de l'utilisateur devient un lien vers son compte, suivi d'un bouton de déconnexion. Remplacez le `<span>{{ user.firstName }} {{ user.lastName }}</span>` par :

```html
<a
  matButton
  routerLink="/compte"
  routerLinkActive="active"
  ariaCurrentWhenActive="page"
>
  {{ user.firstName }} {{ user.lastName }}
</a>
<button matButton="outlined" type="button" (click)="logout()">
  Se déconnecter
</button>
```

Dans `app.ts`, importez `Router` depuis `@angular/router` et ajoutez dans la classe :

```ts
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
```

`void` devant une Promise : on indique qu'on ne l'attend pas, volontairement.

3. **Constatez le problème** : connectez-vous, puis cliquez sur votre nom. "Impossible de charger votre profil." Onglet Réseau, requête `me` : statut **401**, et dans les "En-têtes de requête" (Request Headers), aucune ligne `Authorization`. Le front a le jeton, mais ne l'envoie pas.
4. Créez l'intercepteur, `src/app/auth/auth.interceptor.ts` :

```ts
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthStore } from "./auth-store";

// Appelé pour CHAQUE requête HttpClient (et httpResource) de l'application.
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthStore).token();

  // Le jeton part uniquement vers notre API, jamais vers un autre site.
  const authRequest =
    token && request.url.startsWith("/api/")
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  // next : on passe la requête (modifiée ou non) à la suite de la chaîne.
  return next(authRequest);
};
```

5. Branchez-le dans `app.config.ts` :

```ts
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "./auth/auth.interceptor";
```

```ts
    // HttpClient, avec l'intercepteur qui ajoute le jeton à chaque requête.
    provideHttpClient(withInterceptors([authInterceptor])),
```

6. Prévenez le serveur à la déconnexion, pour qu'il **oublie** le jeton. Dans `auth-store.ts`, remplacez `logout()` :

```ts
  logout(): void {
    if (this.token()) {
      // Le serveur oublie le jeton. On n'attend pas sa réponse, et on ignore une erreur.
      this.http.post('/api/logout', {}).subscribe({ error: () => undefined });
    }
    this.session.set(null);
  }
```

Ici, on s'abonne sans attendre : la requête part, et la déconnexion côté front se fait tout de suite.

### Vérifier

- Cliquez sur votre nom : la page "Mon compte" affiche vos informations. Requête `me` : statut 200, et l'en-tête `Authorization: Bearer ...` est présent.
- La requête `departments` de l'accueil porte aussi le jeton : l'intercepteur s'applique à **toutes** les requêtes vers `/api/`.
- "Se déconnecter" : retour à l'accueil, "Se connecter" réapparaît. Une requête `logout` (204) est partie.
- Déconnecté, tapez l'adresse http://localhost:4200/compte : la page s'affiche avec une erreur. Elle n'est pas protégée : c'est l'objet du module suivant.

---

## Module 12 - Protéger les routes avec un guard (20 min)

### La notion

Un **guard** `canActivate` est une fonction appelée **avant** d'afficher une route. Elle renvoie :

- `true` : la page s'affiche ;
- une **adresse de redirection** (`UrlTree`) : le routeur va ailleurs, ici vers la page de connexion.

Pour un utilisateur qui voulait aller sur `/equipe`, on retient sa destination dans l'adresse : `/connexion?retour=/equipe`. Après la connexion, on l'y renvoie.

### Pas à pas

1. Créez `src/app/auth/auth.guards.ts` :

```ts
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "./auth-store";

// Pages réservées aux utilisateurs connectés.
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  // Pas connecté : direction la connexion, en retenant la page demandée.
  return router.createUrlTree(["/connexion"], {
    queryParams: { retour: state.url },
  });
};
```

`state.url` : l'adresse demandée. `_route` commence par `_` car on ne s'en sert pas.

2. Dans `app.routes.ts`, importez `authGuard` et protégez trois routes avec `canActivate` :

```ts
import { authGuard } from "./auth/auth.guards";
```

```ts
  // Pages publiques.
  { path: '', title: 'Accueil | TechCorp Équipe', component: Home },
  { path: 'labo', title: 'Laboratoire | TechCorp Équipe', component: Labo },
  { path: 'connexion', title: 'Connexion | TechCorp Équipe', component: Login },

  // Pages réservées aux utilisateurs connectés.
  {
    path: 'compte',
    title: 'Mon compte | TechCorp Équipe',
    component: Account,
    canActivate: [authGuard],
  },
  {
    path: 'equipe',
    title: 'Équipe | TechCorp Équipe',
    component: TeamPage,
    canActivate: [authGuard],
  },
  {
    path: 'ajouter',
    title: 'Ajouter un collègue | TechCorp Équipe',
    component: AddEmployee,
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: '' },
```

3. Pour lire `?retour=...` dans la page de connexion, activez la liaison des paramètres d'adresse aux `input()`. Dans `app.config.ts` :

```ts
import { provideRouter, withComponentInputBinding } from "@angular/router";
```

```ts
    // withComponentInputBinding : les paramètres d'URL arrivent dans les input().
    provideRouter(routes, withComponentInputBinding()),
```

(Si vous avez fait le défi intermédiaire de la phase 4 du TP 1 bonus, c'est déjà fait.)

4. Dans `login.ts`, ajoutez `input` à l'import de `@angular/core`, puis une entrée dans la classe :

```ts
  // Paramètre de l'adresse /connexion?retour=/equipe (withComponentInputBinding).
  readonly retour = input<string>();
```

Dans `signIn()`, remplacez `await this.router.navigate(['/equipe']);` par :

```ts
await this.router.navigateByUrl(safeReturnUrl(this.retour()));
```

Et ajoutez cette fonction **à la fin du fichier**, après la classe :

```ts
// Uniquement une page de NOTRE application : "/equipe" oui, "https://pirate.example" non.
// Sinon, un lien piégé pourrait renvoyer l'utilisateur vers un faux site après connexion.
function safeReturnUrl(url: string | undefined): string {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/equipe";
}
```

### Vérifier

- Déconnecté, tapez http://localhost:4200/equipe : vous arrivez sur `/connexion?retour=%2Fequipe` (`%2F` est le `/` encodé).
- Connectez-vous : vous revenez sur `/equipe`, et non sur une page par défaut.
- Déconnecté, essayez `/compte` puis `/ajouter` : même comportement.
- Tapez http://localhost:4200/connexion?retour=https://example.com puis connectez-vous : vous restez dans l'application (`/equipe`). Sans `safeReturnUrl`, un lien piégé pourrait vous envoyer sur un faux site.
- `/labo` et l'accueil restent accessibles sans connexion.

---

## Module 13 - Garder la session après un rechargement (15 min)

### La notion

Le jeton est dans un signal, donc en mémoire : `F5` le fait disparaître. On le recopie dans le **stockage du navigateur** pour le retrouver au démarrage.

| Stockage                                | Durée de vie                     | Lisible par JavaScript |
| --------------------------------------- | -------------------------------- | ---------------------- |
| Signal (mémoire)                        | Jusqu'au rechargement            | Oui                    |
| `sessionStorage`                        | Jusqu'à la fermeture de l'onglet | Oui                    |
| `localStorage`                          | Pour toujours                    | Oui                    |
| Cookie `HttpOnly` (posé par le serveur) | Fixée par le serveur             | **Non**                |

**Le risque** : tout ce qui est lisible par JavaScript peut être volé par un script malveillant injecté dans la page (faille **XSS**). On choisit ici `sessionStorage`, un compromis : le jeton disparaît à la fermeture de l'onglet, et il expire au bout de 30 minutes. En entreprise, on préfère souvent un cookie `HttpOnly`, invisible pour JavaScript (vu au jour 5).

### Pas à pas

Remplacez **tout** le contenu de `src/app/auth/auth-store.ts` :

```ts
import { HttpClient } from "@angular/common/http";
import { Service, computed, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { LoginResponse } from "../models/auth";

const STORAGE_KEY = "equipe.session";

// L'utilisateur connecté et son jeton, partagés par toute l'application.
@Service()
export class AuthStore {
  private readonly http = inject(HttpClient);

  // null : personne n'est connecté. Au démarrage, on relit la session sauvegardée.
  private readonly session = signal<LoginResponse | null>(readSession());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);

  // Rejette la Promise avec une HttpErrorResponse (401) si les identifiants sont faux.
  async login(email: string, password: string): Promise<void> {
    // firstValueFrom : transforme l'Observable de HttpClient en Promise, pour utiliser await.
    const response = await firstValueFrom(
      this.http.post<LoginResponse>("/api/login", { email, password }),
    );
    this.session.set(response);
    saveSession(response);
  }

  logout(): void {
    if (this.token()) {
      // Le serveur oublie le jeton. On n'attend pas sa réponse, et on ignore une erreur.
      this.http.post("/api/logout", {}).subscribe({ error: () => undefined });
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
      sessionStorage.getItem(STORAGE_KEY) ?? "null",
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
```

`sessionStorage` ne stocke que du texte : `JSON.stringify` transforme l'objet en texte, `JSON.parse` fait l'inverse. Le `try` / `catch` protège des contenus illisibles et des navigateurs qui bloquent le stockage.

### Vérifier

- Connectez-vous, puis `F5` : vous êtes toujours connecté.
- DevTools, onglet **Application**, "Session Storage", `http://localhost:4200` : la clé `equipe.session` contient le jeton, lisible en clair. C'est exactement ce qu'un script malveillant pourrait lire.
- Déconnectez-vous : la clé disparaît.
- Connectez-vous, fermez l'onglet, rouvrez http://localhost:4200 : vous êtes déconnecté.

---

## Module 14 - Les rôles : le front masque, le serveur décide (20 min)

### La notion

Seule une administratrice RH (Sarah) peut ajouter, modifier ou supprimer un collègue. Côté front, on fait deux choses :

1. **Masquer** les liens et boutons inutiles pour un employé : c'est du **confort**.
2. **Protéger** les routes avec un second guard : c'est aussi du **confort** (l'employé ne tombe pas sur une page qui ne marchera pas).

**Ni l'un ni l'autre n'est une sécurité.** Le code du front est téléchargé dans le navigateur : n'importe qui peut le lire, le modifier, ou appeler l'API directement. La seule vraie protection est **la vérification faite par le serveur**, à chaque requête.

### Pas à pas

1. Dans `auth-store.ts`, ajoutez un signal calculé sous `isLoggedIn` :

```ts
  // Confort d'affichage uniquement : c'est le serveur qui vérifie les droits.
  readonly isAdmin = computed(() => this.user()?.role === 'admin');
```

2. Dans `auth.guards.ts`, ajoutez un second guard :

```ts
// Pages réservées aux administrateurs RH.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isAdmin()) {
    return true;
  }
  return router.createUrlTree(["/equipe"]);
};
```

3. Dans `app.routes.ts`, importez `adminGuard` et appliquez **les deux** guards à `ajouter` (ils s'exécutent dans l'ordre) :

```ts
  // Pages réservées aux administrateurs RH : les deux guards s'appliquent, dans l'ordre.
  {
    path: 'ajouter',
    title: 'Ajouter un collègue | TechCorp Équipe',
    component: AddEmployee,
    canActivate: [authGuard, adminGuard],
  },
```

4. Dans `app.html`, masquez les liens selon la situation :

```html
<!-- Liens masques si l'utilisateur n'a pas acces : les guards protegent quand meme les routes. -->
@if (auth.isLoggedIn()) {
<a
  matButton
  routerLink="/equipe"
  routerLinkActive="active"
  ariaCurrentWhenActive="page"
  >Équipe</a
>
} @if (auth.isAdmin()) {
<a
  matButton
  routerLink="/ajouter"
  routerLinkActive="active"
  ariaCurrentWhenActive="page"
  >Ajouter</a
>
}
```

### Vérifier

- Connecté en tant que Claire : pas de lien "Ajouter". Tapez http://localhost:4200/ajouter : vous êtes renvoyée sur `/equipe`.
- Connecté en tant que Sarah : le lien "Ajouter" est là et la page s'ouvre.
- **Le serveur décide** : reconnectez-vous en tant que Claire, ouvrez la console (`F12`) et tapez (Chrome peut vous demander de taper d'abord `allow pasting` pour autoriser le collage) :

```js
const { token } = JSON.parse(sessionStorage.getItem("equipe.session"));
fetch("/api/employees/5", {
  method: "DELETE",
  headers: { Authorization: "Bearer " + token },
})
  .then((response) => response.json())
  .then(console.log);
```

Réponse : `{ message: "Action réservée aux administrateurs RH." }`, statut **403**. Claire a contourné le front en deux lignes, mais le serveur a refusé. Si l'API ne vérifiait pas le rôle, masquer le bouton n'aurait rien protégé.

---

## Module 15 - Session expirée : gérer le 401 avec `catchError` (20 min)

### La notion

Un jeton peut cesser d'être valide pendant que l'utilisateur travaille : il a expiré (30 minutes ici), ou le serveur a redémarré (la fausse API oublie alors tous les jetons). Le serveur répond **401** à la requête suivante.

Plutôt que d'afficher une erreur incompréhensible, l'intercepteur réagit : il efface la session et renvoie vers la connexion avec un message clair.

L'opérateur RxJS `catchError` intercepte une erreur dans un flux. On y fait notre traitement, puis on **relance** l'erreur avec `throwError` pour que le composant qui a fait la requête soit prévenu lui aussi.

### Pas à pas

1. Remplacez **tout** le contenu de `auth.interceptor.ts` :

```ts
import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthStore } from "./auth-store";

// Appelé pour CHAQUE requête HttpClient (et httpResource) de l'application.
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const token = auth.token();

  // Le jeton part uniquement vers notre API, jamais vers un autre site.
  const authRequest =
    token && request.url.startsWith("/api/")
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      // 401 alors qu'on avait un jeton : il a expiré, ou le serveur a redémarré.
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        auth.token()
      ) {
        auth.clear();
        void router.navigate(["/connexion"], {
          queryParams: { expiree: 1, retour: router.url },
        });
      }
      // On relance l'erreur : le composant qui a fait la requête peut aussi la traiter.
      return throwError(() => error);
    }),
  );
};
```

La condition `auth.token()` est importante : un 401 sur `/api/login` (mauvais mot de passe) arrive alors qu'on n'a **pas** de jeton. Ce n'est pas une session expirée, la page de connexion affiche son propre message.

2. Dans `login.ts`, ajoutez une seconde entrée sous `retour` :

```ts
  readonly expiree = input<string>();
```

3. Dans `login.html`, sous le `<h1>` :

```html
@if (expiree()) {
<p class="info" role="status">
  Votre session a expiré. Reconnectez-vous pour continuer.
</p>
}
```

4. Dans `login.css` :

```css
.info {
  padding: 0.75rem;
  border-left: 4px solid #1d4ed8;
  background-color: #eff6ff;
}
```

### Vérifier

- Connectez-vous et ouvrez "Mon compte".
- Dans le terminal de l'API, arrêtez-la (`Ctrl + C`) et relancez-la (`npm start`) : elle a oublié votre jeton.
- Dans l'application, cliquez sur "Accueil" puis de nouveau sur votre nom : vous êtes renvoyé sur la connexion avec le message "Votre session a expiré", et l'adresse contient `retour=%2Fcompte`.
- Reconnectez-vous : vous revenez sur "Mon compte".
- Un mauvais mot de passe affiche toujours "Adresse e-mail ou mot de passe incorrect.", sans redirection.

---

## Défis de la phase 3

### Intermédiaire

1. Un utilisateur déjà connecté qui ouvre `/connexion` est renvoyé sur `/equipe`.
2. Ajoutez un bouton "Afficher" à côté du mot de passe, qui bascule le champ entre `type="password"` et `type="text"`.

Indices :

- un troisième guard, `guestGuard`, qui fait l'inverse d'`authGuard` ;
- un signal `showPassword`, `[type]="showPassword() ? 'text' : 'password'"` ;
- pour l'accessibilité, un bouton bascule porte `[attr.aria-pressed]` (TP 1 bonus, module 7) et `type="button"` pour ne pas envoyer le formulaire.

### Avancé

1. **Déconnexion automatique** : à l'heure exacte de `expiresAt`, l'utilisateur est déconnecté et renvoyé sur la connexion avec le message d'expiration, **sans** attendre une requête. Utilisez uniquement RxJS : `toObservable` sur la session, `switchMap` et `timer`. Pourquoi `switchMap` et pas `map` ? Testez en lançant l'API avec `TOKEN_TTL_MINUTES=1 npm start`.
2. **Page "Accès refusé"** : au lieu de renvoyer un employé sur `/equipe` sans explication, `adminGuard` le redirige vers une page `/acces-refuse` qui explique pourquoi.

---

# Phase 4 - Le CRUD des collègues

**CRUD** : Create, Read, Update, Delete. Les quatre opérations de base sur des données, qui correspondent aux méthodes HTTP `POST`, `GET`, `PUT` et `DELETE`.

## Module 16 - Lire la liste depuis l'API (20 min)

### La notion

L'annuaire affiche encore les 3 collègues **en mémoire** du `TeamStore`. L'API en connaît 32. On remplace le service par une `httpResource` (module 8).

Nouveauté : la recherche se fait **côté serveur**. Au lieu de télécharger tous les collègues puis de filtrer dans le navigateur (TP 1 bonus, module 13), on envoie le texte au serveur : `GET /api/employees?q=moreau`. Avec des milliers de collègues, c'est indispensable.

La fonction passée à `httpResource` est **réactive**, comme un `computed` : elle lit `this.search()`. Chaque fois que la recherche change, l'adresse change, et une nouvelle requête part toute seule.

### Pas à pas

1. Remplacez **tout** le contenu de `src/app/pages/team-page/team-page.ts` :

```ts
import { httpResource } from "@angular/common/http";
import { Component, signal } from "@angular/core";
import { EmployeeCard } from "../../employee-card/employee-card";
import { Employee } from "../../models/employee";
import { SearchBox } from "../../search-box/search-box";

@Component({
  imports: [EmployeeCard, SearchBox],
  selector: "app-team-page",
  styleUrl: "./team-page.css",
  templateUrl: "./team-page.html",
})
export class TeamPage {
  // Ce que l'utilisateur tape, à chaque frappe.
  protected readonly search = signal("");

  // Relancée automatiquement quand search change.
  // ?q=... : recherche côté serveur, _sort=lastName : tri par nom.
  protected readonly employees = httpResource<Employee[]>(() => ({
    url: "/api/employees",
    params: { q: this.search(), _sort: "lastName" },
  }));
}
```

`params` : Angular construit l'adresse pour vous, `/api/employees?q=moreau&_sort=lastName`, en encodant les caractères spéciaux.

2. Remplacez **tout** le contenu de `team-page.html` :

```html
<h1>L'équipe</h1>

<app-search-box [(query)]="search" />

<!-- Une seule zone annoncee au lecteur d'ecran : l'etat du chargement. -->
<p aria-live="polite">
  @if (employees.isLoading()) { Chargement de l'équipe... } @else if
  (employees.error()) { Impossible de charger l'équipe. } @else if
  (employees.hasValue()) { {{ employees.value().length }} collègue(s) affiché(s)
  }
</p>

@if (employees.error()) {
<button type="button" class="retry" (click)="employees.reload()">
  Réessayer
</button>
} @if (employees.hasValue()) {
<ul class="team">
  @for (employee of employees.value(); track employee.id) {
  <li>
    <app-employee-card [employee]="employee" />
  </li>
  } @empty {
  <li>Aucun collègue ne correspond à « {{ search() }} ».</li>
  }
</ul>
}
```

Le bouton "Retirer" disparaît : la suppression reviendra sur la fiche du collègue (module 21), réservée à l'administratrice.

3. Dans `team-page.css`, remplacez la règle `.remove` par :

```css
.error {
  color: #b91c1c;
}

.retry {
  padding: 0.25rem 0.75rem;
  font: inherit;
}
```

### Vérifier

- Connecté, la page "Équipe" affiche "Chargement de l'équipe..." puis **32** collègues, triés par nom.
- Tapez "moreau" **lentement** dans la recherche, en regardant l'onglet Réseau : **une requête par lettre** (6 requêtes). Certaines apparaissent "(annulée)" (canceled) : quand la recherche change avant la réponse, `httpResource` abandonne l'ancienne requête.
- Tapez "informatique" : la recherche `q` du serveur cherche dans **tous** les champs, y compris le service.
- Le formulaire "Ajouter" utilise encore le `TeamStore` : un collègue ajouté n'apparaît pas dans la liste. Il sera branché sur l'API au module 19.

---

## Module 17 - Une recherche plus sobre avec `debounceTime` (20 min)

### La notion

Six requêtes pour un mot de six lettres, c'est du gaspillage : seule la dernière nous intéresse. On veut attendre que l'utilisateur **arrête de taper** avant d'interroger le serveur. C'est le rôle de l'opérateur RxJS `debounceTime`.

```text
frappes :     m  o  r  e  a  u  ............
debounceTime(300) :                 moreau      (une seule valeur, 300 ms après la dernière frappe)
```

Mais `search` est un **signal**, et les opérateurs RxJS travaillent sur des **Observables**. On fait l'aller-retour :

```text
signal  --toObservable-->  Observable  --pipe(opérateurs)-->  Observable  --toSignal-->  signal
```

C'est le pont entre les deux mondes : **les signals pour l'état et l'affichage, RxJS pour les traitements dans le temps**.

### Pas à pas

1. Dans `team-page.ts`, complétez les imports :

```ts
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, map } from "rxjs";
```

2. Sous le signal `search`, ajoutez :

```ts
  // La même recherche, mais "calmée" : elle ne change que 300 ms après la dernière frappe.
  // signal -> Observable (toObservable) -> opérateurs RxJS -> signal (toSignal).
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(
      debounceTime(300), // attend 300 ms sans nouvelle frappe
      map((text) => text.trim()), // ignore les espaces autour
      distinctUntilChanged(), // ignore une valeur identique à la précédente
    ),
    { initialValue: '' },
  );
```

3. Dans la `httpResource`, remplacez `this.search()` par `this.debouncedSearch()` :

```ts
  // Relancée automatiquement quand debouncedSearch change.
  // ?q=... : recherche côté serveur, _sort=lastName : tri par nom.
  protected readonly employees = httpResource<Employee[]>(() => ({
    url: '/api/employees',
    params: { q: this.debouncedSearch(), _sort: 'lastName' },
  }));
```

Le champ de recherche, lui, reste relié à `search` : ce que vous tapez s'affiche immédiatement.

### Vérifier

- Tapez "moreau" à vitesse normale : **une seule** requête dans l'onglet Réseau.
- Tapez "moreau", puis ajoutez un espace à la fin : aucune nouvelle requête. `map` retire l'espace, et `distinctUntilChanged` voit que la valeur n'a pas changé.
- Effacez la recherche : la liste complète revient.

---

## Module 18 - La fiche d'un collègue (20 min)

### La notion

Chaque collègue a sa page : `/equipe/12`. Le paramètre `:id` de la route arrive dans une entrée `id` du composant (grâce à `withComponentInputBinding`, module 12), et la `httpResource` lit `/api/employees/12`.

Un identifiant inexistant fait répondre le serveur **404**. On distingue ce cas ("collègue introuvable") d'une panne du serveur.

### Pas à pas

1. Générez la page :

```bash
ng generate component pages/employee-detail
```

`src/app/pages/employee-detail/employee-detail.ts` :

```ts
import { HttpErrorResponse, httpResource } from "@angular/common/http";
import { Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Employee } from "../../models/employee";

@Component({
  imports: [RouterLink],
  selector: "app-employee-detail",
  styleUrl: "./employee-detail.css",
  templateUrl: "./employee-detail.html",
})
export class EmployeeDetail {
  // Le paramètre :id de l'adresse /equipe/:id (withComponentInputBinding).
  readonly id = input.required<string>();

  // Relancée si l'id change (passage d'une fiche à une autre).
  protected readonly employee = httpResource<Employee>(
    () => `/api/employees/${this.id()}`,
  );

  // 404 : l'identifiant n'existe pas. On le distingue d'une panne du serveur.
  protected readonly notFound = computed(() => {
    const error = this.employee.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });
}
```

Un paramètre d'adresse est toujours du **texte** : `id` est un `string`, même s'il contient "12".

2. `employee-detail.html` :

```html
<p><a routerLink="/equipe">Retour à l'équipe</a></p>

@if (employee.isLoading()) {
<p>Chargement de la fiche...</p>
} @else if (notFound()) {
<h1>Collègue introuvable</h1>
<p>Aucun collègue ne porte l'identifiant {{ id() }}.</p>
} @else if (employee.error()) {
<h1>Fiche indisponible</h1>
<p class="error">Impossible de charger la fiche. Réessayez plus tard.</p>
} @else if (employee.hasValue()) { @let e = employee.value();
<h1>{{ e.firstName }} {{ e.lastName }}</h1>
<dl>
  <dt>Poste</dt>
  <dd>{{ e.job }}</dd>
  <dt>Service</dt>
  <dd>{{ e.department }}</dd>
  <dt>E-mail</dt>
  <dd>
    <a [href]="'mailto:' + e.email">{{ e.email }}</a>
  </dd>
  <dt>Lieu de travail</dt>
  <dd>{{ e.remote ? 'En télétravail' : 'Sur site' }}</dd>
</dl>
}
```

3. `employee-detail.css` :

```css
dt {
  font-weight: 700;
}

dd {
  margin: 0 0 0.75rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.error {
  color: #b91c1c;
}

.alert {
  padding: 0.75rem;
  border-left: 4px solid #b91c1c;
  background-color: #fef2f2;
  color: #7f1d1d;
}
```

4. Route protégée dans `app.routes.ts` (importez `EmployeeDetail`), sous la route `equipe` :

```ts
  {
    path: 'equipe/:id',
    title: 'Fiche collègue | TechCorp Équipe',
    component: EmployeeDetail,
    canActivate: [authGuard],
  },
```

5. Le nom sur chaque carte devient un lien vers la fiche. Dans `employee-card.ts`, importez `RouterLink` depuis `@angular/router` et ajoutez-le aux `imports` du composant. Dans `employee-card.html`, remplacez le `<h3>` :

```html
<h3 class="card__name">
  <!-- Le nom mène à la fiche : /equipe/12 -->
  <a [routerLink]="['/equipe', employee().id]">
    {{ employee().firstName }} {{ employee().lastName }}
  </a>
</h3>
```

`['/equipe', 12]` : le routeur assemble l'adresse `/equipe/12`.

### Vérifier

- Cliquez sur un nom dans l'annuaire : la fiche s'affiche, l'onglet indique "Fiche collègue".
- "Retour à l'équipe" ramène à l'annuaire. Le bouton "Précédent" du navigateur aussi.
- Tapez http://localhost:4200/equipe/999 : "Collègue introuvable". Onglet Réseau : statut 404.
- Déconnecté, une fiche renvoie vers la connexion, puis y revient après connexion.

---

## Module 19 - Créer un collègue (25 min)

### La notion

Pour **agir**, on revient à `HttpClient` : `post` envoie le formulaire, le serveur répond avec le collègue créé (et son nouvel `id`). On attend la réponse avec `firstValueFrom` dans l'action de soumission, comme pour la connexion.

Le serveur peut refuser : une adresse e-mail déjà utilisée provoque une erreur **409** (conflit). L'action de soumission des Signal Forms peut **renvoyer une erreur** rattachée à un champ : elle s'affiche sous ce champ, exactement comme une erreur de validation.

### Pas à pas

1. Créez le service des collègues :

```bash
ng generate service api/employee-api
```

`src/app/api/employee-api.ts` :

```ts
import { HttpClient } from "@angular/common/http";
import { Service, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Employee } from "../models/employee";

// Un collègue sans id : c'est le serveur qui choisit l'identifiant.
export type EmployeeDraft = Omit<Employee, "id">;

const API_URL = "/api/employees";

// Les actions sur les collègues. Les listes, elles, sont lues avec httpResource.
@Service()
export class EmployeeApi {
  private readonly http = inject(HttpClient);

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${API_URL}/${id}`);
  }

  create(draft: EmployeeDraft): Observable<Employee> {
    return this.http.post<Employee>(API_URL, draft);
  }

  update(id: number, draft: EmployeeDraft): Observable<Employee> {
    return this.http.put<Employee>(`${API_URL}/${id}`, draft);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
```

Les quatre méthodes sont écrites d'un coup : les modules 20 et 21 s'en serviront.

2. Remplacez **tout** le contenu de `src/app/pages/add-employee/add-employee.ts` :

```ts
import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormField,
  FormRoot,
  TreeValidationResult,
  email,
  form,
  maxLength,
  minLength,
  required,
} from "@angular/forms/signals";
import { MatButton } from "@angular/material/button";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { apiErrorMessage } from "../../api/api-error";
import { DepartmentApi } from "../../api/department-api";
import { EmployeeApi, EmployeeDraft } from "../../api/employee-api";

const EMPTY_DRAFT: EmployeeDraft = {
  firstName: "",
  lastName: "",
  email: "",
  job: "",
  department: "Informatique",
  remote: false,
};

@Component({
  imports: [FormField, FormRoot, MatButton],
  selector: "app-add-employee",
  styleUrl: "./add-employee.css",
  templateUrl: "./add-employee.html",
})
export class AddEmployee {
  private readonly api = inject(EmployeeApi);
  private readonly departmentApi = inject(DepartmentApi);
  private readonly router = inject(Router);

  // La liste des services vient de l'API : Observable -> signal.
  protected readonly departments = toSignal(this.departmentApi.getNames(), {
    initialValue: [],
  });

  private readonly draft = signal<EmployeeDraft>({ ...EMPTY_DRAFT });

  protected readonly employeeForm = form(
    this.draft,
    (path) => {
      required(path.firstName, { message: "Le prénom est obligatoire." });
      required(path.lastName, { message: "Le nom est obligatoire." });
      minLength(path.lastName, 2, {
        message: "Le nom doit contenir au moins 2 lettres.",
      });
      required(path.email, { message: "L'e-mail est obligatoire." });
      email(path.email, {
        message:
          "L'e-mail n'est pas valide (exemple : prenom.nom@techcorp.fr).",
      });
      required(path.job, { message: "Le poste est obligatoire." });
      maxLength(path.job, 40, {
        message: "Le poste ne doit pas dépasser 40 caractères.",
      });
    },
    {
      submission: {
        action: async () => this.save(),
      },
    },
  );

  // Erreur générale du serveur, affichée au-dessus des boutons.
  protected readonly serverError = signal("");

  protected resetForm(): void {
    this.employeeForm().reset({ ...EMPTY_DRAFT });
  }

  private async save(): Promise<TreeValidationResult> {
    this.serverError.set("");
    try {
      const created = await firstValueFrom(this.api.create(this.draft()));
      // Le serveur a choisi l'id : on affiche la fiche du nouveau collègue.
      await this.router.navigate(["/equipe", created.id]);
      return undefined;
    } catch (error) {
      // 409 : e-mail déjà utilisé. L'erreur est rattachée au champ e-mail.
      if (error instanceof HttpErrorResponse && error.status === 409) {
        return {
          kind: "server",
          message: apiErrorMessage(error),
          fieldTree: this.employeeForm.email,
        };
      }
      this.serverError.set(apiErrorMessage(error));
      return undefined;
    }
  }
}
```

`TreeValidationResult` : ce que l'action peut renvoyer. `undefined` signifie "pas d'erreur" ; un objet `{ kind, message, fieldTree }` place une erreur sur le champ indiqué.

3. Dans `add-employee.html`, ajoutez au-dessus de `<div class="form__actions">` :

```html
@if (serverError()) {
<p class="alert" role="alert">{{ serverError() }}</p>
}
```

Et désactivez le bouton pendant l'envoi :

```html
<button
  matButton="filled"
  type="submit"
  [disabled]="employeeForm().submitting()"
>
  Ajouter
</button>
```

4. Dans `add-employee.css`, ajoutez :

```css
.alert {
  margin: 0;
  padding: 0.75rem;
  border-left: 4px solid #b91c1c;
  background-color: #fef2f2;
  color: #7f1d1d;
}
```

5. Le `TeamStore` n'est plus utilisé nulle part : **supprimez** le fichier `src/app/team-store.ts`. Si `ng build` signale encore un import de `TeamStore`, supprimez-le.

### Vérifier

- Connecté en tant que Sarah, remplissez le formulaire avec `ana.lopez@techcorp.fr` : vous arrivez sur la fiche du nouveau collègue (`/equipe/33`), et il apparaît dans l'annuaire.
- Onglet Réseau, requête `employees` en `POST` : la charge utile contient le formulaire, la réponse contient le même objet **avec un `id`**.
- Recommencez avec l'e-mail `claire.martin@techcorp.fr` : le message "Cette adresse e-mail est déjà utilisée par un collègue." s'affiche **sous le champ e-mail**, bordure rouge comprise. Modifiez l'e-mail : le message disparaît.
- Rechargez la page `F5` : le collègue est toujours là. Les données sont maintenant **sur le serveur**, plus en mémoire.

---

## _Module 20 - Modifier un collègue (20 min) -> ta stoppé la_

### La notion

Le formulaire de modification est le **même** que celui d'ajout, prérempli. Plutôt que de dupliquer le composant, on lui donne deux modes :

- `/ajouter` : pas d'`id`, le formulaire est vide, l'envoi fait un `POST` ;
- `/equipe/12/modifier` : un `id`, on charge la fiche, l'envoi fait un `PUT`.

Pour charger la fiche, on utilise `subscribe` (module 6). Pas besoin de se désabonner : une requête HTTP émet **une** valeur puis se termine.

### Pas à pas

1. Dans `add-employee.ts` :
   - ajoutez `OnInit` et `input` à l'import de `@angular/core`, et `RouterLink` à celui de `@angular/router` ;
   - ajoutez `RouterLink` au tableau `imports` du composant ;
   - importez le modèle : `import { Employee } from '../../models/employee';` ;
   - la classe implémente `OnInit` : `export class AddEmployee implements OnInit {`.

2. Dans la classe, sous `router`, ajoutez l'entrée :

```ts
  // Présent seulement en modification : le :id de l'adresse.
  readonly id = input<string>();
```

3. Sous `serverError`, ajoutez le chargement :

```ts
  ngOnInit(): void {
    const id = this.id();
    if (id) {
      // Modification : on charge la fiche, puis on remplit le formulaire.
      // Pas besoin de se désabonner : une requête HTTP émet une seule valeur puis se termine.
      this.api.getById(Number(id)).subscribe({
        next: (employee) => this.draft.set(toDraft(employee)),
        error: (error: unknown) => this.serverError.set(apiErrorMessage(error)),
      });
    }
  }
```

Pourquoi `ngOnInit` et pas le `constructor` ? Les entrées (`id`) ne sont pas encore disponibles dans le constructeur.

4. Remplacez `save()` : selon le mode, `create` ou `update`.

```ts
  private async save(): Promise<TreeValidationResult> {
    this.serverError.set('');
    const id = this.id();
    try {
      const saved = id
        ? await firstValueFrom(this.api.update(Number(id), this.draft()))
        : await firstValueFrom(this.api.create(this.draft()));
      await this.router.navigate(['/equipe', saved.id]);
      return undefined;
    } catch (error) {
      // 409 : e-mail déjà utilisé. L'erreur est rattachée au champ e-mail.
      if (error instanceof HttpErrorResponse && error.status === 409) {
        return {
          kind: 'server',
          message: apiErrorMessage(error),
          fieldTree: this.employeeForm.email,
        };
      }
      this.serverError.set(apiErrorMessage(error));
      return undefined;
    }
  }
```

5. À la fin du fichier, après la classe :

```ts
// La fiche reçue contient un id : le formulaire, lui, n'en a pas.
function toDraft(employee: Employee): EmployeeDraft {
  const { id, ...draft } = employee;
  return draft;
}
```

`const { id, ...draft } = employee` : on sort `id` de l'objet, et `draft` reçoit **toutes les autres** propriétés.

6. Dans `add-employee.html`, le titre et les boutons s'adaptent au mode :

```html
<h1>{{ id() ? 'Modifier un collègue' : 'Ajouter un collègue' }}</h1>
```

```html
<div class="form__actions">
  <button
    matButton="filled"
    type="submit"
    [disabled]="employeeForm().submitting()"
  >
    {{ id() ? 'Enregistrer' : 'Ajouter' }}
  </button>
  @if (id()) {
  <a matButton="outlined" [routerLink]="['/equipe', id()]">Annuler</a>
  } @else {
  <button matButton="outlined" type="button" (click)="resetForm()">
    Effacer
  </button>
  }
</div>
```

7. Ajoutez la route dans `app.routes.ts`, sous `ajouter`. Elle réutilise le **même** composant et les **mêmes** guards :

```ts
  {
    path: 'equipe/:id/modifier',
    title: 'Modifier un collègue | TechCorp Équipe',
    component: AddEmployee,
    canActivate: [authGuard, adminGuard],
  },
```

8. Sur la fiche, ajoutez un lien "Modifier", visible seulement par l'administratrice. Dans `employee-detail.ts` :
   - importez `inject` (depuis `@angular/core`), `MatButton` (depuis `@angular/material/button`) et `AuthStore` ;
   - ajoutez `MatButton` aux `imports` du composant : `imports: [MatButton, RouterLink],` ;
   - ajoutez dans la classe : `protected readonly auth = inject(AuthStore);`.

Dans `employee-detail.html`, après `</dl>` (toujours dans le bloc `hasValue()`) :

```html
<!-- Boutons masques aux employes : confort d'affichage, le serveur verifie aussi. -->
@if (auth.isAdmin()) {
<div class="actions">
  <a matButton="outlined" [routerLink]="['/equipe', e.id, 'modifier']"
    >Modifier</a
  >
</div>
}
```

### Vérifier

- En tant que Sarah, ouvrez une fiche puis "Modifier" : le formulaire est prérempli (le service aussi), le titre est "Modifier un collègue".
- Changez le poste, puis "Enregistrer" : retour à la fiche, le nouveau poste s'affiche. Onglet Réseau : une requête `PUT /api/employees/<id>`.
- "Annuler" revient à la fiche sans rien enregistrer.
- Remplacez l'e-mail par celui d'un autre collègue : l'erreur 409 s'affiche sous le champ.
- En tant que Claire : pas de bouton "Modifier", et l'adresse `/equipe/1/modifier` renvoie sur `/equipe`.

---

## Module 21 - Supprimer un collègue (15 min)

### La notion

La suppression est **irréversible** : on demande une confirmation avant d'envoyer le `DELETE`. `confirm()` affiche une boîte de dialogue native du navigateur, accessible au clavier et aux lecteurs d'écran.

Le serveur a ses propres règles : un employé reçoit 403, et une administratrice ne peut pas supprimer **sa propre** fiche (409). On affiche son message tel quel.

### Pas à pas

1. Dans `employee-detail.ts`, les imports deviennent :

```ts
import { HttpErrorResponse, httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { Router, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { apiErrorMessage } from "../../api/api-error";
import { EmployeeApi } from "../../api/employee-api";
import { AuthStore } from "../../auth/auth-store";
import { Employee } from "../../models/employee";
```

2. Dans la classe, ajoutez :

```ts
  private readonly api = inject(EmployeeApi);
  private readonly router = inject(Router);

  protected readonly deleting = signal(false);
  protected readonly actionError = signal('');

  protected async remove(employee: Employee): Promise<void> {
    const confirmed = confirm(
      `Supprimer ${employee.firstName} ${employee.lastName} ? Ses demandes de congé seront aussi supprimées.`,
    );
    if (!confirmed) {
      return;
    }
    this.deleting.set(true);
    this.actionError.set('');
    try {
      await firstValueFrom(this.api.delete(employee.id));
      await this.router.navigate(['/equipe']);
    } catch (error) {
      // 403 (pas administrateur) ou 409 (sa propre fiche) : le serveur explique pourquoi.
      this.actionError.set(apiErrorMessage(error));
    } finally {
      this.deleting.set(false);
    }
  }
```

3. Dans `employee-detail.html`, complétez le bloc des actions :

```html
@if (auth.isAdmin()) {
<div class="actions">
  <a matButton="outlined" [routerLink]="['/equipe', e.id, 'modifier']"
    >Modifier</a
  >
  <button
    matButton="filled"
    type="button"
    class="danger"
    [disabled]="deleting()"
    (click)="remove(e)"
  >
    {{ deleting() ? 'Suppression...' : 'Supprimer' }}
  </button>
</div>
} @if (actionError()) {
<p class="alert" role="alert">{{ actionError() }}</p>
}
```

4. Dans `employee-detail.css`, un bouton rouge pour une action destructrice :

```css
.danger {
  --mat-button-filled-container-color: #b91c1c;
}
```

### Vérifier

- En tant que Sarah, supprimez le collègue créé au module 19 : confirmation, puis retour à l'annuaire, qui affiche de nouveau 32 collègues.
- Cliquez sur "Supprimer" puis "Annuler" dans la boîte de dialogue : rien n'est envoyé (onglet Réseau vide).
- Ouvrez la fiche de Sarah Lefèvre (`/equipe/3`) et essayez de la supprimer : "Vous ne pouvez pas supprimer votre propre fiche." Le front n'a pas prévu ce cas, le serveur si.
- Le CRUD est complet : **C**réer (module 19), **L**ire (16 à 18), **M**odifier (20), **S**upprimer (21).

---

## Défis de la phase 4

### Intermédiaire

1. Ajoutez sur la page équipe une liste déroulante "Service" (avec "Tous les services") qui filtre l'annuaire **côté serveur**.
2. Ajoutez une liste "Trier par" : nom, prénom ou service.

Indices :

- deux signals, `department` (`''` pour tous) et `sort` ;
- json-server filtre avec `?department=Finance` et trie avec `?_sort=firstName` ;
- pour n'envoyer `department` que s'il est choisi : `...(this.department() ? { department: this.department() } : {})` dans `params` ;
- la liste des services est déjà disponible : `DepartmentApi.getNames()` et `toSignal`.

### Avancé

1. **Pagination** : affichez 8 collègues par page, avec "Page précédente" / "Page suivante" et "32 collègue(s), page 1 sur 4". json-server accepte `?_page=2&_limit=8` et renvoie le total dans l'en-tête `X-Total-Count` (lisible avec `employees.headers()`). Quand la recherche ou le filtre change, la page doit revenir à 1 : utilisez `linkedSignal`.
2. **Modifications non enregistrées** : si l'utilisateur quitte le formulaire (ajout ou modification) après l'avoir modifié, demandez une confirmation avec un guard `canDeactivate` (réutilisez celui du défi avancé de la phase 5 du TP 1 bonus si vous l'avez fait). Attention : après un enregistrement réussi, la navigation vers la fiche ne doit **pas** déclencher la question.

---

# Phase 5 - Les congés

## Module 22 - Mes demandes de congé (20 min)

### La notion

Chaque collègue a des demandes de congé (`GET /api/leaves`). On les affiche dans un **tableau**, la bonne structure HTML pour des données en lignes et colonnes.

**Sécurité** : le front envoie `?employeeId=1`, mais c'est le serveur qui décide. Pour un employé, il **ignore** ce paramètre et renvoie uniquement les demandes de l'utilisateur du jeton. Sinon, Claire pourrait lire les congés de Julien en changeant un chiffre dans l'adresse.

### Pas à pas

1. Créez le modèle :

```bash
ng generate interface models/leave
```

`src/app/models/leave.ts` :

```ts
export type LeaveType = "paid" | "rtt" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected";

// Une demande de congé, telle que renvoyée par GET /api/leaves.
export interface Leave {
  id: number;
  employeeId: number;
  type: LeaveType;
  startDate: string; // format AAAA-MM-JJ
  endDate: string;
  days: number; // jours ouvrés, calculés par le serveur
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

// Ce que le client envoie pour créer une demande : le serveur fixe le reste.
export interface NewLeave {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

// Libellés affichés à l'utilisateur.
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  paid: "Congés payés",
  rtt: "RTT",
  unpaid: "Sans solde",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: "En attente",
  approved: "Acceptée",
  rejected: "Refusée",
};
```

`Record<LeaveType, string>` : un objet qui a **exactement** une propriété par type de congé. Si vous en oubliez une, TypeScript le signale.

2. Pour afficher les dates en français ("2 nov. 2026"), enregistrez la langue dans `app.config.ts` :

```ts
import { registerLocaleData } from "@angular/common";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import localeFr from "@angular/common/locales/fr";
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "./app.routes";
import { authInterceptor } from "./auth/auth.interceptor";

// Noms des jours et des mois en français pour le pipe date.
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // HttpClient, avec l'intercepteur qui ajoute le jeton à chaque requête.
    provideHttpClient(withInterceptors([authInterceptor])),
    // withComponentInputBinding : les paramètres d'URL arrivent dans les input().
    provideRouter(routes, withComponentInputBinding()),
    { provide: LOCALE_ID, useValue: "fr-FR" },
  ],
};
```

3. Générez la page :

```bash
ng generate component pages/leaves/leaves-page --flat
```

`--flat` : les fichiers sont créés directement dans `pages/leaves/`, sans sous-dossier.

`src/app/pages/leaves/leaves-page.ts` :

```ts
import { DatePipe } from "@angular/common";
import { httpResource } from "@angular/common/http";
import { Component, computed, inject } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { AuthStore } from "../../auth/auth-store";
import {
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  Leave,
} from "../../models/leave";

@Component({
  imports: [DatePipe, MatButton],
  selector: "app-leaves-page",
  styleUrl: "./leaves-page.css",
  templateUrl: "./leaves-page.html",
})
export class LeavesPage {
  private readonly auth = inject(AuthStore);

  protected readonly typeLabels = LEAVE_TYPE_LABELS;
  protected readonly statusLabels = LEAVE_STATUS_LABELS;

  // employeeId : pour un employé, le serveur l'impose de toute façon (il lit le jeton).
  protected readonly leaves = httpResource<Leave[]>(() => ({
    url: "/api/leaves",
    params: {
      employeeId: this.auth.user()?.id ?? 0,
      _sort: "startDate",
      _order: "desc",
    },
  }));

  // Calculés à partir de la réponse du serveur.
  protected readonly pendingCount = computed(() =>
    this.leaves.hasValue()
      ? this.leaves.value().filter((l) => l.status === "pending").length
      : 0,
  );
  protected readonly approvedPaidDays = computed(() =>
    this.leaves.hasValue()
      ? this.leaves
          .value()
          .filter((l) => l.type === "paid" && l.status === "approved")
          .reduce((total, l) => total + l.days, 0)
      : 0,
  );
}
```

`reduce` : parcourt le tableau en accumulant un total, ici la somme des jours.

4. `src/app/pages/leaves/leaves-page.html` :

```html
<h1>Mes congés</h1>

<section aria-labelledby="list-title">
  <h2 id="list-title">Mes demandes</h2>

  <p aria-live="polite">
    @if (leaves.isLoading()) { Chargement des demandes... } @else if
    (leaves.error()) { Impossible de charger vos demandes. } @else if
    (leaves.hasValue()) { {{ pendingCount() }} demande(s) en attente, {{
    approvedPaidDays() }} jour(s) de congés payés acceptés. }
  </p>

  @if (leaves.error()) {
  <button matButton="outlined" type="button" (click)="leaves.reload()">
    Réessayer
  </button>
  } @if (leaves.hasValue()) {
  <!-- Un tableau qui defile horizontalement sur mobile, sans faire deborder la page. -->
  <div
    class="table-wrapper"
    tabindex="0"
    role="region"
    aria-labelledby="list-title"
  >
    <table>
      <thead>
        <tr>
          <th scope="col">Type</th>
          <th scope="col">Du</th>
          <th scope="col">Au</th>
          <th scope="col">Jours</th>
          <th scope="col">Statut</th>
          <th scope="col"><span class="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        @for (leave of leaves.value(); track leave.id) {
        <tr>
          <td>{{ typeLabels[leave.type] }}</td>
          <td>{{ leave.startDate | date: 'd MMM y' }}</td>
          <td>{{ leave.endDate | date: 'd MMM y' }}</td>
          <td>{{ leave.days }}</td>
          <td>
            <span class="status" [class]="'status--' + leave.status">
              {{ statusLabels[leave.status] }}
            </span>
          </td>
          <td></td>
        </tr>
        } @empty {
        <tr>
          <td colspan="6">Aucune demande pour le moment.</td>
        </tr>
        }
      </tbody>
    </table>
  </div>
  }
</section>
```

- `scope="col"` : le lecteur d'écran sait que la cellule est l'en-tête de sa colonne, et l'annonce avec chaque valeur.
- `tabindex="0"` et `role="region"` sur le conteneur : un utilisateur au clavier peut le sélectionner et le faire défiler avec les flèches.
- La dernière colonne accueillera le bouton "Annuler" au module 23.

5. `src/app/pages/leaves/leaves-page.css` :

```css
section {
  margin-top: 2rem;
}

/* position: relative : le texte masque (.visually-hidden) reste dans le cadre defilant. */
.table-wrapper {
  position: relative;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.5rem;
  border-bottom: 1px solid #d1d5db;
  text-align: left;
  white-space: nowrap;
}

/* Le statut est ecrit en toutes lettres : la couleur n'est qu'un complement. */
.status {
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.status--pending {
  background-color: #fef3c7;
  color: #78350f;
}

.status--approved {
  background-color: #dcfce7;
  color: #14532d;
}

.status--rejected {
  background-color: #fee2e2;
  color: #7f1d1d;
}

/* Lisible par les lecteurs d'ecran, invisible a l'ecran. */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

6. Route protégée dans `app.routes.ts` (importez `LeavesPage` depuis `./pages/leaves/leaves-page`) :

```ts
  {
    path: 'conges',
    title: 'Mes congés | TechCorp Équipe',
    component: LeavesPage,
    canActivate: [authGuard],
  },
```

7. Dans `app.html`, ajoutez le lien dans le bloc `@if (auth.isLoggedIn())`, après "Équipe" :

```html
<a
  matButton
  routerLink="/conges"
  routerLinkActive="active"
  ariaCurrentWhenActive="page"
  >Mes congés</a
>
```

### Vérifier

- En tant que Claire, "Mes congés" affiche 4 demandes, de la plus récente à la plus ancienne, avec des dates en français. Le résumé indique "2 demande(s) en attente, 10 jour(s) de congés payés acceptés".
- **Le serveur filtre** : dans la console, demandez les congés de Julien (id 2) avec le jeton de Claire :

```js
const { token } = JSON.parse(sessionStorage.getItem("equipe.session"));
fetch("/api/leaves?employeeId=2", {
  headers: { Authorization: "Bearer " + token },
})
  .then((response) => response.json())
  .then(console.log);
```

Vous recevez **les 4 demandes de Claire** (`employeeId: 1`). Le paramètre envoyé par le front n'est qu'une indication, le serveur décide à partir du jeton.

- En vue mobile (375 px), le tableau défile horizontalement, mais la page, elle, ne déborde pas.

---

## Module 23 - Demander et annuler un congé (25 min)

### La notion

Dernier module : un formulaire de demande et un bouton d'annulation, qui réunissent tout ce que vous avez vu.

- Une règle de validation **entre deux champs** : la date de fin doit être après la date de début. `validate` reçoit `valueOf`, qui lit la valeur d'un **autre** champ.
- Après une création ou une annulation, la liste doit se mettre à jour : `this.leaves.reload()` relance la requête. Le serveur a calculé les jours ouvrés et fixé le statut : on relit sa version plutôt que de deviner.

### Pas à pas

1. Créez le service :

```bash
ng generate service api/leave-api
```

`src/app/api/leave-api.ts` :

```ts
import { HttpClient } from "@angular/common/http";
import { Service, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Leave, NewLeave } from "../models/leave";

const API_URL = "/api/leaves";

@Service()
export class LeaveApi {
  private readonly http = inject(HttpClient);

  create(leave: NewLeave): Observable<Leave> {
    return this.http.post<Leave>(API_URL, leave);
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
```

2. Dans `leaves-page.ts`, les imports deviennent :

```ts
import { DatePipe } from "@angular/common";
import { httpResource } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import {
  FormField,
  FormRoot,
  form,
  maxLength,
  required,
  validate,
} from "@angular/forms/signals";
import { MatButton } from "@angular/material/button";
import { firstValueFrom } from "rxjs";
import { apiErrorMessage } from "../../api/api-error";
import { LeaveApi } from "../../api/leave-api";
import { AuthStore } from "../../auth/auth-store";
import {
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  Leave,
  NewLeave,
} from "../../models/leave";
```

Ajoutez `FormField` et `FormRoot` aux `imports` du composant : `imports: [DatePipe, FormField, FormRoot, MatButton],`.

Au-dessus de `@Component`, les valeurs de départ du formulaire :

```ts
const EMPTY_LEAVE: NewLeave = {
  type: "paid",
  startDate: "",
  endDate: "",
  reason: "",
};
```

3. Dans la classe, ajoutez le service (`private readonly api = inject(LeaveApi);` sous `auth`), puis, sous `approvedPaidDays` :

```ts
  private readonly draft = signal<NewLeave>({ ...EMPTY_LEAVE });

  protected readonly leaveForm = form(
    this.draft,
    (path) => {
      required(path.startDate, { message: 'La date de début est obligatoire.' });
      required(path.endDate, { message: 'La date de fin est obligatoire.' });
      // Règle qui compare deux champs : valueOf lit la valeur d'un autre champ.
      validate(path.endDate, ({ value, valueOf }) => {
        const start = valueOf(path.startDate);
        if (start && value() && value() < start) {
          return { kind: 'order', message: 'La date de fin doit être après la date de début.' };
        }
        return undefined;
      });
      maxLength(path.reason, 100, { message: 'Le motif ne doit pas dépasser 100 caractères.' });
    },
    {
      submission: {
        action: async () => this.send(),
      },
    },
  );

  // Résultat de la dernière action, annoncé aux lecteurs d'écran.
  protected readonly message = signal('');

  protected async cancel(leave: Leave): Promise<void> {
    if (!confirm('Annuler cette demande de congé ?')) {
      return;
    }
    try {
      await firstValueFrom(this.api.cancel(leave.id));
      this.message.set('La demande a été annulée.');
      this.leaves.reload();
    } catch (error) {
      this.message.set(apiErrorMessage(error));
    }
  }

  private async send(): Promise<void> {
    this.message.set('');
    try {
      await firstValueFrom(this.api.create(this.draft()));
      this.leaveForm().reset({ ...EMPTY_LEAVE });
      this.message.set('Votre demande a été envoyée.');
      // On relit la liste : le serveur a calculé les jours et fixé le statut.
      this.leaves.reload();
    } catch (error) {
      this.message.set(apiErrorMessage(error));
    }
  }
```

Les dates au format `AAAA-MM-JJ` se comparent comme du texte : `'2026-12-01' < '2026-12-10'` vaut `true`.

4. Dans `leaves-page.html`, ajoutez sous le `<h1>` la zone de message :

```html
<p class="message" role="status">{{ message() }}</p>
```

Dans le tableau, remplacez la cellule vide `<td></td>` par le bouton d'annulation, affiché seulement pour une demande en attente :

```html
<td>
  @if (leave.status === 'pending') {
  <button
    matButton
    type="button"
    [attr.aria-label]="
                      'Annuler la demande du ' + (leave.startDate | date: 'd MMMM y')
                    "
    (click)="cancel(leave)"
  >
    Annuler
  </button>
  }
</td>
```

Sans `aria-label`, un lecteur d'écran annoncerait plusieurs boutons "Annuler" identiques.

Enfin, à la fin du fichier, le formulaire :

```html
<section aria-labelledby="form-title">
  <h2 id="form-title">Nouvelle demande</h2>

  @let startDate = leaveForm.startDate(); @let endDate = leaveForm.endDate();
  @let reason = leaveForm.reason();

  <form class="form" [formRoot]="leaveForm">
    <div class="field">
      <label for="type">Type</label>
      <select id="type" [formField]="leaveForm.type">
        <option value="paid">Congés payés</option>
        <option value="rtt">RTT</option>
        <option value="unpaid">Sans solde</option>
      </select>
    </div>

    <div class="field">
      <label for="start-date">Date de début</label>
      <input
        id="start-date"
        type="date"
        [formField]="leaveForm.startDate"
        [attr.aria-invalid]="startDate.touched() && startDate.invalid()"
        [attr.aria-describedby]="
          startDate.touched() && startDate.invalid() ? 'start-date-error' : null
        "
      />
      @if (startDate.touched() && startDate.invalid()) {
      <p class="field__error" id="start-date-error">
        {{ startDate.errors()[0].message }}
      </p>
      }
    </div>

    <div class="field">
      <label for="end-date">Date de fin</label>
      <input
        id="end-date"
        type="date"
        [formField]="leaveForm.endDate"
        [attr.aria-invalid]="endDate.touched() && endDate.invalid()"
        [attr.aria-describedby]="endDate.touched() && endDate.invalid() ? 'end-date-error' : null"
      />
      @if (endDate.touched() && endDate.invalid()) {
      <p class="field__error" id="end-date-error">
        {{ endDate.errors()[0].message }}
      </p>
      }
    </div>

    <div class="field">
      <label for="reason">Motif (facultatif)</label>
      <input
        id="reason"
        [formField]="leaveForm.reason"
        [attr.aria-invalid]="reason.touched() && reason.invalid()"
        [attr.aria-describedby]="reason.touched() && reason.invalid() ? 'reason-error' : null"
      />
      @if (reason.touched() && reason.invalid()) {
      <p class="field__error" id="reason-error">
        {{ reason.errors()[0].message }}
      </p>
      }
    </div>

    <div>
      <button
        matButton="filled"
        type="submit"
        [disabled]="leaveForm().submitting()"
      >
        {{ leaveForm().submitting() ? 'Envoi...' : 'Envoyer la demande' }}
      </button>
    </div>
  </form>
</section>
```

5. Dans `leaves-page.css`, ajoutez :

```css
.message:empty {
  display: none;
}

.message {
  padding: 0.75rem;
  border-left: 4px solid #1d4ed8;
  background-color: #eff6ff;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 24rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input,
select {
  padding: 0.5rem;
  border: 1px solid #6b7280;
  border-radius: 0.25rem;
  font: inherit;
}

.field__error {
  margin: 0;
  color: #b91c1c;
}

[aria-invalid="true"] {
  border-color: #b91c1c;
}
```

Le paragraphe `role="status"` est **toujours présent** dans la page, même vide : un lecteur d'écran n'annonce une zone que si elle existait avant que son contenu change. `:empty` le masque visuellement quand il n'y a rien à dire.

### Vérifier

- Choisissez une date de fin **avant** la date de début, puis "Envoyer la demande" : "La date de fin doit être après la date de début." et aucune requête.
- Une demande valide : le message "Votre demande a été envoyée." apparaît, le formulaire se vide, la liste se recharge avec la nouvelle demande "En attente" et son nombre de jours **calculé par le serveur**.
- Choisissez un samedi et un dimanche : le serveur refuse ("La période ne contient aucun jour ouvré."). Le front ne vérifiait pas cette règle, le serveur si.
- "Annuler" sur une demande en attente : confirmation, puis elle disparaît de la liste.
- Les demandes acceptées ou refusées n'ont pas de bouton "Annuler". Le serveur refuserait de toute façon (409).

---

## Défis de la phase 5

### Intermédiaire

1. Ajoutez une liste "Afficher" (toutes, en attente, acceptées, refusées) qui filtre le tableau **côté client**.
2. Affichez le solde : "Solde restant : N jour(s)", sur la base de 25 jours de congés payés par an, moins les jours acceptés **et** en attente.

Indices :

- un signal `statusFilter` et un `computed` `visibleLeaves` qui filtre `leaves.value()` ; le `@for` parcourt `visibleLeaves()` ;
- pour le solde, un `computed` avec `filter` (type `paid`, statut différent de `rejected`) et `reduce`. Claire doit avoir 1 jour restant.

### Avancé

Créez une page **"Demandes à traiter"** (`/demandes`), réservée à l'administratrice, avec un lien dans la navigation :

1. Elle charge **en parallèle** les demandes en attente (`GET /api/leaves?status=pending`) et la liste des collègues, avec l'opérateur `forkJoin`, puis affiche un tableau avec le **nom** du collègue de chaque demande.
2. Deux boutons par ligne, "Accepter" et "Refuser", envoient `PATCH /api/leaves/:id` avec `{ status: 'approved' }` ou `{ status: 'rejected' }`. La ligne traitée disparaît sans recharger la page.
3. Question : pourquoi `forkJoin` plutôt que deux `subscribe` imbriqués ? Comparez le temps de chargement dans l'onglet Réseau.

---

## Livrables attendus

- [ ] L'API et l'application démarrent, sans erreur dans les terminaux ni dans la console du navigateur (`F12`), hors erreurs HTTP volontaires (401, 403, 404, 409)
- [ ] La page "Labo" montre l'ordre d'exécution, une Promise avec chargement et erreur, un chronomètre sans fuite et une horloge en `toSignal`
- [ ] L'accueil affiche les services de l'API, avec les états chargement, erreur et "Réessayer"
- [ ] La connexion fonctionne, affiche les erreurs du serveur, et la session survit à `F5`
- [ ] Les pages équipe, fiche, congés et compte sont protégées par `authGuard` ; l'ajout et la modification par `adminGuard`
- [ ] Une session expirée (redémarrage de l'API) renvoie vers la connexion avec un message
- [ ] L'annuaire permet de rechercher (une requête après la frappe), d'ouvrir une fiche, et pour l'administratrice d'ajouter, modifier et supprimer un collègue
- [ ] "Mes congés" liste les demandes, permet d'en créer et d'annuler celles en attente
- [ ] La navigation au clavier fonctionne partout, et rien ne déborde en largeur mobile (375 px)
- [ ] `ng build` passe sans erreur

## Ce que vous retrouverez dans TechCorp RH

| Ce TP                                                       | Le projet fil rouge                                    |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| `DepartmentApi`, `toSignal` (modules 6, 7)                  | Les services d'accès à l'API (jour 4)                  |
| `httpResource` (modules 8, 16, 18, 22)                      | `EmployeeDirectory`, `LeaveStore` (jour 4)             |
| `HttpClient` + `firstValueFrom` pour agir (modules 19 à 23) | Création et annulation d'une demande de congé (jour 4) |
| `AuthStore`, page de connexion (modules 9, 10, 13)          | `Session`, page de connexion (jour 5)                  |
| `authInterceptor` (modules 11, 15)                          | `authInterceptor` (jour 5)                             |
| `authGuard`, `adminGuard` (modules 12, 14)                  | `authGuard`, `teamAccessGuard` (jours 3 et 5)          |
| La fausse API json-server                                   | L'API NestJS avec JWT et bcrypt (jour 5)               |

---

## Erreurs fréquentes

| Symptôme                                                                                | Cause probable                                           | Solution                                                                       |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Erreur 502 sur `/api/...`, `http proxy error ... ECONNREFUSED` dans le terminal Angular | L'API n'est pas lancée                                   | `npm start` dans `api-mock-equipe`                                             |
| Erreur 404 sur `/api/...` en `GET`                                                      | Proxy non pris en compte                                 | Vérifier `proxy.conf.json` et `angular.json`, puis **redémarrer** `npm start`  |
| `NullInjectorError: No provider for HttpClient`                                         | `provideHttpClient()` absent de `app.config.ts`          | L'ajouter (module 5)                                                           |
| 401 sur toutes les routes protégées alors qu'on est connecté                            | Intercepteur non branché, ou jeton envoyé sans `Bearer ` | `withInterceptors([authInterceptor])`, vérifier l'en-tête dans l'onglet Réseau |
| Déconnecté à chaque `F5`                                                                | Session non sauvegardée                                  | Module 13 : `readSession()` et `saveSession()`                                 |
| Renvoyé sur la connexion après un redémarrage de l'API                                  | Comportement normal : l'API a oublié les jetons          | Se reconnecter                                                                 |
| Aucune requête ne part                                                                  | `subscribe` oublié sur un Observable de `HttpClient`     | S'abonner, ou utiliser `toSignal` / `firstValueFrom`                           |
| `NG0950: Input "id" is required but no value is available yet`                          | `withComponentInputBinding()` absent                     | L'ajouter à `provideRouter` (module 12)                                        |
| `this.leaves.value()` lève une erreur                                                   | Lecture de `value()` alors que la requête a échoué       | Tester `hasValue()` avant                                                      |
| Le formulaire s'envoie mais la liste ne change pas                                      | Liste non rechargée                                      | `this.leaves.reload()` après l'action                                          |
| 403 "Action réservée aux administrateurs RH."                                           | Connecté avec un compte employé                          | Se connecter avec `sarah.lefevre@techcorp.fr`                                  |
| La page déborde en largeur sur mobile                                                   | Tableau sans conteneur défilant                          | `.table-wrapper { position: relative; overflow-x: auto; }`                     |
| Port 3000 déjà utilisé                                                                  | L'API du jour 4 (`api-mock`) tourne déjà                 | L'arrêter avant de lancer `api-mock-equipe`                                    |
