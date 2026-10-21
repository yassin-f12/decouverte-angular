# TP 1 bonus - Découvrir Angular pas à pas

**Durée indicative** : 5 h à 6 h, à votre rythme (21 modules de 10 à 20 minutes)
**Prérequis** : TP 1 terminé (Node.js, Angular CLI et VS Code installés et vérifiés)
**Livrable** : une petite application **TechCorp Équipe**, construite module après module : un accueil avec un compteur de congés, un annuaire de l'équipe avec recherche, et un formulaire d'ajout validé. `ng build` passe sans erreur.

---

## Pourquoi ce TP

Le projet fil rouge TechCorp RH avance vite et mélange beaucoup de notions à la fois. Ce TP reprend Angular **depuis zéro, une notion à la fois**, dans un petit projet séparé où vous pouvez vous tromper sans risque.

Chaque module suit le même plan :

1. **La notion** : ce que vous allez apprendre, en quelques lignes.
2. **Pas à pas** : le code à écrire, fichier par fichier.
3. **Vérifier** : ce que vous devez voir dans le navigateur.

Ne copiez pas sans lire : tapez le code, lisez les commentaires, et vérifiez le résultat **à chaque module** avant de passer au suivant.

## Choisir son niveau

| Niveau            | Ce que vous faites                                                                 | Pour qui                                                   |
| ----------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Débutant**      | Tous les modules "Pas à pas", dans l'ordre                                         | Vous découvrez Angular, ou le TP 1 vous a semblé difficile |
| **Intermédiaire** | Les modules, puis le **défi intermédiaire** de chaque phase (indices fournis)      | Les modules vous semblent faciles                          |
| **Avancé**        | Les modules en lecture rapide, puis le **défi avancé** de chaque phase (sans aide) | Vous avez déjà utilisé un framework front-end              |

Vous pouvez changer de niveau en cours de route. Les défis se trouvent à la fin de chaque phase.

## Plan du TP

| Phase              | Modules | Ce que vous construisez                                                         |
| ------------------ | ------- | ------------------------------------------------------------------------------- |
| 1. Les bases       | 1 à 3   | Le projet, un message d'accueil, un premier bouton                              |
| 2. État et signals | 4 à 6   | Un statut du jour et un compteur de congés                                      |
| 3. Composants      | 7 à 12  | Des cartes de collègues, une liste, des affichages conditionnels                |
| 4. Architecture    | 13 à 17 | Une recherche, un service, trois pages, un premier formulaire, Angular Material |
| 5. Signal Forms    | 18 à 21 | Un formulaire d'ajout complet, validé et accessible                             |

### Le vocabulaire en un coup d'oeil

| Mot           | Ce que c'est                                                                            |
| ------------- | --------------------------------------------------------------------------------------- |
| **Composant** | Un morceau d'interface : une classe TypeScript + un template HTML + des styles CSS      |
| **Template**  | Le HTML d'un composant, enrichi de la syntaxe Angular (`{{ }}`, `[ ]`, `( )`, `@if`...) |
| **Signal**    | Une boîte qui contient une valeur et prévient Angular quand elle change                 |
| **Service**   | Une classe qui contient des données ou de la logique partagées entre composants         |
| **Route**     | L'association entre une adresse (`/equipe`) et la page à afficher                       |

---

# Phase 1 - Les bases

## Module 1 - Démarrer un projet (20 min)

### La notion

`ng new` crée un projet Angular complet : configuration, dépendances, serveur de développement. Vous n'avez rien à configurer à la main.

### Pas à pas

1. Ce projet est un **bac à sable** : créez-le **en dehors** de votre dépôt fil rouge. Dans Git Bash :

```bash
cd ~
mkdir -p cda
cd cda
ng new decouverte-angular --style=css --ssr=false --skip-tests --defaults
cd decouverte-angular
code .
```

- `--style=css` : styles en CSS classique
- `--ssr=false` : pas de rendu côté serveur (inutile ici)
- `--skip-tests` : pas de fichiers de tests, pour garder le projet léger (les tests sont vus au jour 6)

2. Lancez le serveur de développement :

```bash
npm start
```

3. Ouvrez http://localhost:4200 : la page d'accueil d'Angular s'affiche. **Laissez le serveur tourner** pendant tout le TP : chaque fois que vous enregistrez un fichier, la page se recharge toute seule.
4. Faites le tour des fichiers importants dans VS Code :

| Fichier            | Rôle                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| `src/index.html`   | La seule page HTML de l'application. Elle contient la balise `<app-root>` |
| `src/main.ts`      | Le point d'entrée : il démarre Angular avec le composant `App`            |
| `src/app/app.ts`   | La classe du composant racine `App` (sa logique)                          |
| `src/app/app.html` | Le template de `App` (ce qui s'affiche)                                   |
| `src/app/app.css`  | Les styles réservés au composant `App`                                    |
| `src/styles.css`   | Les styles globaux, appliqués à toute l'application                       |

5. Remplacez **tout** le contenu de `src/app/app.html` par :

```html
<h1>TechCorp Équipe</h1>
<p>Ma première application Angular.</p>

<!-- Zone d'affichage des pages : elle servira au module 15. -->
<router-outlet />
```

6. Complétez `src/index.html` : la langue, le titre de l'onglet et une description (accessibilité et référencement) :

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>TechCorp Équipe</title>
    <meta name="description" content="Découverte d'Angular : annuaire de l'équipe TechCorp." />
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

- `lang="fr"` : le lecteur d'écran lit la page avec une prononciation française
- `viewport` : indispensable pour que la page s'adapte au mobile

7. Ajoutez quelques styles globaux dans `src/styles.css` :

```css
/* Styles globaux : ils s'appliquent a toute l'application. */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

/* Contour de focus bien visible pour la navigation au clavier. */
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

### Vérifier

- La page affiche "TechCorp Équipe" et l'onglet du navigateur aussi.
- Faites un clic droit puis "Inspecter" : la balise `<app-root>` contient votre `<h1>`. C'est Angular qui l'a inséré.

---

## Module 2 - Afficher des données avec l'interpolation (15 min)

### La notion

L'**interpolation** `{{ ... }}` affiche dans le template une valeur venant de la classe du composant. Entre les accolades, on peut écrire une **expression** simple : une propriété, un calcul, un appel de méthode.

### Pas à pas

1. Remplacez le contenu de `src/app/app.ts` :

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// @Component transforme la classe en composant Angular.
@Component({
  imports: [RouterOutlet],
  selector: 'app-root', // la balise <app-root> de index.html
  styleUrl: './app.css', // ses styles
  templateUrl: './app.html', // son template
})
export class App {
  // protected : utilisable dans le template, mais pas depuis d'autres classes.
  // readonly : la valeur ne sera jamais remplacée.
  protected readonly appName = 'TechCorp Équipe';
  protected readonly userName = 'Claire';
}
```

2. Remplacez le contenu de `src/app/app.html` :

```html
<h1>{{ appName }}</h1>
<p>Bonjour {{ userName }}</p>

<!-- Une expression peut contenir un calcul ou un appel de methode. -->
<p>Nous sommes en {{ 2020 + 6 }}. Votre prénom compte {{ userName.length }} lettres.</p>
<p>En majuscules : {{ userName.toUpperCase() }}</p>

<router-outlet />
```

### Vérifier

- La page affiche "Bonjour Claire", "Nous sommes en 2026" et "5 lettres".
- Dans `app.ts`, remplacez `'Claire'` par votre prénom et enregistrez : la page se met à jour.
- Écrivez volontairement `{{ userNam }}` (faute de frappe) : le terminal affiche une erreur `Property 'userNam' does not exist`. Angular vérifie vos templates. Corrigez.

---

## Module 3 - Réagir aux événements avec `(click)` (15 min)

### La notion

La syntaxe `(evenement)="methode()"` **écoute** un événement du navigateur (`click`, `input`, `submit`...) et appelle une méthode de la classe. Les parenthèses signifient : "du template vers la classe".

### Pas à pas

1. Dans `src/app/app.ts`, ajoutez une propriété et une méthode dans la classe `App` :

```ts
export class App {
  protected readonly appName = 'TechCorp Équipe';
  protected readonly userName = 'Claire';
  protected message = '';

  protected sayHello(): void {
    this.message = 'Bienvenue dans TechCorp Équipe, ' + this.userName + ' !';
  }
}
```

`message` n'a pas de `readonly` : sa valeur va changer.

2. Dans `src/app/app.html`, ajoutez sous les paragraphes :

```html
<!-- type="button" : ce bouton ne sert pas a envoyer un formulaire. -->
<button type="button" (click)="sayHello()">Dire bonjour</button>

<!-- aria-live : le lecteur d'ecran annonce le message quand il apparait. -->
<p aria-live="polite">{{ message }}</p>
```

### Vérifier

- Un clic sur "Dire bonjour" affiche le message de bienvenue.
- Le bouton fonctionne aussi au clavier : touche `Tab` pour l'atteindre, puis `Entrée` ou `Espace`. Un vrai `<button>` est accessible sans effort, une `<div>` cliquable ne l'est pas.

---

## Défis de la phase 1

### Intermédiaire

Ajoutez un bouton "Effacer" qui vide le message.

Indices : une seconde méthode `clearMessage()`, qui remet `message` à `''`.

### Avancé

1. Affichez le message en majuscules, sans modifier la propriété `message`.
2. Ajoutez un champ texte. À chaque frappe, recopiez son contenu dans un paragraphe "Vous tapez : ...", en utilisant l'événement `(input)` et une variable de template (`#monChamp`). Pas de `FormsModule`.

---

# Phase 2 - L'état avec les signals

## Module 4 - Les signals modifiables, partie 1 : `set` (15 min)

### La notion

Un **signal** est une boîte qui contient une valeur. Quand la valeur change, Angular sait **exactement** quelles parties de l'écran mettre à jour. C'est la manière recommandée de gérer l'état dans Angular moderne.

| Action                      | Code                          |
| --------------------------- | ----------------------------- |
| Créer                       | `status = signal('sur site')` |
| Lire (avec des parenthèses) | `status()`                    |
| Remplacer la valeur         | `status.set('absent')`        |

### Pas à pas

1. Dans `src/app/app.ts`, importez `signal` et ajoutez un statut du jour :

```ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Un type qui n'accepte que ces trois textes : une faute de frappe sera refusée.
type Status = 'sur site' | 'en télétravail' | 'absent';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly appName = 'TechCorp Équipe';
  protected readonly userName = 'Claire';
  protected message = '';

  // Un signal qui contient le statut du jour, "sur site" au départ.
  protected readonly status = signal<Status>('sur site');

  protected sayHello(): void {
    this.message = 'Bienvenue dans TechCorp Équipe, ' + this.userName + ' !';
  }

  protected changeStatus(newStatus: Status): void {
    // set() remplace la valeur : l'écran se met à jour tout seul.
    this.status.set(newStatus);
  }
}
```

2. Dans `src/app/app.html`, ajoutez avant `<router-outlet />` :

```html
<section aria-labelledby="status-title">
  <h2 id="status-title">Mon statut aujourd'hui</h2>
  <!-- On LIT un signal en l'appelant : status() -->
  <p>Vous êtes : <strong>{{ status() }}</strong></p>

  <button type="button" (click)="changeStatus('sur site')">Sur site</button>
  <button type="button" (click)="changeStatus('en télétravail')">En télétravail</button>
  <button type="button" (click)="changeStatus('absent')">Absent</button>
</section>
```

### Vérifier

- Chaque bouton change le statut affiché.
- Écrivez `{{ status }}` sans parenthèses : la page affiche `[Signal (status): sur site]` et le terminal un avertissement `NG8109: status is a function and should be invoked`. **Un signal se lit toujours avec `()`**. Remettez les parenthèses.
- Dans `changeStatus('absent')`, remplacez `'absent'` par `'malade'` : le terminal signale une erreur, car `'malade'` n'est pas un `Status`. Annulez.

---

## Module 5 - Les signals modifiables, partie 2 : `update` (15 min)

### La notion

`set()` remplace la valeur sans regarder l'ancienne. Quand la nouvelle valeur **dépend de l'ancienne** (ajouter 1, retirer un élément d'une liste), on utilise `update()` : il reçoit l'ancienne valeur et renvoie la nouvelle.

```ts
compteur.set(0); // "mets 0"
compteur.update((valeur) => valeur + 1); // "prends la valeur actuelle et ajoute 1"
```

### Pas à pas

1. Dans la classe `App`, ajoutez un compteur de jours de congés posés et trois méthodes :

```ts
  protected readonly totalDays = 25;
  protected readonly daysTaken = signal(0);

  protected addDay(): void {
    this.daysTaken.update((days) => days + 1);
  }

  protected removeDay(): void {
    this.daysTaken.update((days) => days - 1);
  }

  protected reset(): void {
    this.daysTaken.set(0);
  }
```

`signal(0)` : TypeScript devine tout seul que le signal contient un `number`.

2. Dans `src/app/app.html`, ajoutez une nouvelle section avant `<router-outlet />` :

```html
<section aria-labelledby="leave-title">
  <h2 id="leave-title">Mes congés</h2>
  <p>Jours posés : {{ daysTaken() }} sur {{ totalDays }}</p>

  <button type="button" (click)="addDay()">Poser un jour</button>
  <button type="button" (click)="removeDay()">Annuler un jour</button>
  <button type="button" (click)="reset()">Remettre à zéro</button>
</section>
```

### Vérifier

- "Poser un jour" augmente le compteur, "Annuler un jour" le diminue, "Remettre à zéro" le remet à 0.
- Cliquez plusieurs fois sur "Annuler un jour" depuis 0 : le compteur devient négatif. C'est un bug, il sera corrigé au module 7.

---

## Module 6 - Les signals calculés : `computed` (15 min)

### La notion

Un signal **calculé** (`computed`) déduit sa valeur d'autres signals. Il se recalcule **automatiquement** quand un des signals qu'il lit change. On ne le modifie jamais à la main : pas de `set()` ni d'`update()`.

### Pas à pas

1. Dans `src/app/app.ts`, ajoutez `computed` à l'import :

```ts
import { Component, computed, signal } from '@angular/core';
```

2. Dans la classe, sous `daysTaken`, ajoutez deux signals calculés :

```ts
  // Recalculés automatiquement quand daysTaken change.
  protected readonly remainingDays = computed(() => this.totalDays - this.daysTaken());
  protected readonly isEmpty = computed(() => this.remainingDays() === 0);
```

3. Dans la section "Mes congés" de `app.html`, remplacez le paragraphe "Jours posés" par :

```html
<p>Jours posés : {{ daysTaken() }}</p>
<!-- aria-live : le lecteur d'ecran annonce le nouveau solde. -->
<p aria-live="polite">Jours restants : {{ remainingDays() }} / {{ totalDays }}</p>
@if (isEmpty()) {
<p>Vous avez posé tous vos jours.</p>
}
```

`@if` sera expliqué au module 12 : pour l'instant, retenez qu'il affiche le paragraphe seulement si `isEmpty()` vaut `true`.

### Vérifier

- À chaque clic, "Jours posés" et "Jours restants" changent ensemble, alors que vous ne modifiez jamais `remainingDays` vous-même.
- À 25 jours posés, le message "Vous avez posé tous vos jours" apparaît.

---

## Défis de la phase 2

### Intermédiaire

Ajoutez un signal calculé `usedPercent` qui donne le pourcentage de jours posés (arrondi avec `Math.round`) et affichez-le : "Vous avez utilisé 12 % de vos congés".

Indice : `computed(() => Math.round((this.daysTaken() / this.totalDays) * 100))`.

### Avancé

1. Ajoutez un bouton "Poser une semaine" (+5 jours), qui ne dépasse jamais le total : 23 jours posés + une semaine donne 25, pas 28.
2. Ajoutez un signal `history` de type `string[]` : chaque action ajoute une ligne ("+1 jour", "Remise à zéro"...) avec `update` et le **spread** (`[...liste, nouvelle]`). Pourquoi ne faut-il pas utiliser `liste.push()` dans un `update` ?

---

# Phase 3 - Les composants

## Module 7 - Lier des propriétés et des attributs (15 min)

### La notion

La syntaxe `[propriete]="expression"` **lie** une propriété d'un élément HTML à une valeur de la classe. Les crochets signifient : "de la classe vers le template". Quand la valeur change, l'élément est mis à jour.

| Syntaxe       | Exemple                              | Effet                                                                  |
| ------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| `[propriete]` | `[disabled]="isEmpty()"`             | Désactive le bouton si `isEmpty()` vaut `true`                         |
| `[class.nom]` | `[class.counter--empty]="isEmpty()"` | Ajoute ou retire une classe CSS                                        |
| `[attr.nom]`  | `[attr.aria-pressed]="..."`          | Pour les attributs qui ne sont pas des propriétés (ARIA, `colspan`...) |

### Pas à pas

1. Dans la section "Mes congés" de `app.html`, corrigez le bug du module 5 : on ne peut plus poser de jour quand le solde est vide, ni en annuler quand on n'en a posé aucun.

```html
<p aria-live="polite" [class.counter--empty]="isEmpty()">
  Jours restants : {{ remainingDays() }} / {{ totalDays }}
</p>

<button type="button" [disabled]="isEmpty()" (click)="addDay()">Poser un jour</button>
<button type="button" [disabled]="daysTaken() === 0" (click)="removeDay()">Annuler un jour</button>
<button type="button" (click)="reset()">Remettre à zéro</button>
```

Supprimez le bloc `@if (isEmpty())` du module 6 : la couleur rouge le remplace.

2. Dans `src/app/app.css`, ajoutez :

```css
.counter--empty {
  color: #b91c1c;
  font-weight: 700;
}

/* Le bouton du statut choisi est mis en evidence. */
[aria-pressed='true'] {
  background-color: #dbeafe;
}
```

3. Dans la section "Mon statut aujourd'hui", indiquez quel bouton est actif avec `aria-pressed`. Le lecteur d'écran annoncera "bouton bascule, enfoncé" :

```html
<button
  type="button"
  [attr.aria-pressed]="status() === 'sur site'"
  (click)="changeStatus('sur site')"
>
  Sur site
</button>
<button
  type="button"
  [attr.aria-pressed]="status() === 'en télétravail'"
  (click)="changeStatus('en télétravail')"
>
  En télétravail
</button>
<button type="button" [attr.aria-pressed]="status() === 'absent'" (click)="changeStatus('absent')">
  Absent
</button>
```

### Vérifier

- À 0 jour posé, "Annuler un jour" est grisé. À 25, "Poser un jour" est grisé et le solde passe en rouge.
- Inspectez un bouton de statut : l'attribut `aria-pressed` passe de `false` à `true` quand vous cliquez.

---

## Module 8 - Créer et imbriquer des composants (20 min)

### La notion

Un composant regroupe un morceau d'interface **réutilisable**. Au lieu d'un énorme `app.html`, on découpe l'écran en petits composants, puis on les **imbrique** comme des balises HTML : `<app-leave-counter />`.

Pour utiliser un composant dans un autre, il faut l'ajouter au tableau `imports` du parent.

### Pas à pas

1. Dans un **second terminal** (le premier fait tourner `npm start`), générez deux composants :

```bash
ng generate component leave-counter
ng generate component employee-card
```

Chaque commande crée un dossier avec trois fichiers : `.ts`, `.html` et `.css`.

2. **Déplacez le compteur de congés** dans son propre composant. Remplacez `src/app/leave-counter/leave-counter.ts` :

```ts
import { Component, computed, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-leave-counter',
  styleUrl: './leave-counter.css',
  templateUrl: './leave-counter.html',
})
export class LeaveCounter {
  protected readonly totalDays = 25;
  protected readonly daysTaken = signal(0);

  // Recalculés automatiquement quand daysTaken change.
  protected readonly remainingDays = computed(() => this.totalDays - this.daysTaken());
  protected readonly isEmpty = computed(() => this.remainingDays() === 0);

  protected addDay(): void {
    this.daysTaken.update((days) => days + 1);
  }

  protected removeDay(): void {
    this.daysTaken.update((days) => days - 1);
  }

  protected reset(): void {
    this.daysTaken.set(0);
  }
}
```

3. `src/app/leave-counter/leave-counter.html` : collez le **contenu** de la section "Mes congés" (sans la balise `<section>` ni le `<h2>`, qui restent dans `App`) :

```html
<p>Jours posés : {{ daysTaken() }}</p>
<!-- aria-live : le lecteur d'ecran annonce le nouveau solde. -->
<p aria-live="polite" [class.counter--empty]="isEmpty()">
  Jours restants : {{ remainingDays() }} / {{ totalDays }}
</p>

<button type="button" [disabled]="isEmpty()" (click)="addDay()">Poser un jour</button>
<button type="button" [disabled]="daysTaken() === 0" (click)="removeDay()">Annuler un jour</button>
<button type="button" (click)="reset()">Remettre à zéro</button>
```

4. Déplacez la règle `.counter--empty` de `app.css` vers `src/app/leave-counter/leave-counter.css`.
5. Nettoyez `src/app/app.ts` : supprimez `totalDays`, `daysTaken`, `remainingDays`, `isEmpty`, `addDay`, `removeDay` et `reset`. Retirez `computed` de l'import. Puis **importez les deux nouveaux composants** :

```ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeeCard } from './employee-card/employee-card';
import { LeaveCounter } from './leave-counter/leave-counter';

type Status = 'sur site' | 'en télétravail' | 'absent';

@Component({
  // Chaque composant utilisé dans le template doit être listé ici.
  imports: [EmployeeCard, LeaveCounter, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly appName = 'TechCorp Équipe';
  protected readonly userName = 'Claire';
  protected message = '';

  protected readonly status = signal<Status>('sur site');

  protected sayHello(): void {
    this.message = 'Bienvenue dans TechCorp Équipe, ' + this.userName + ' !';
  }

  protected changeStatus(newStatus: Status): void {
    this.status.set(newStatus);
  }
}
```

6. Dans `src/app/app.html`, la section "Mes congés" devient :

```html
<section aria-labelledby="leave-title">
  <h2 id="leave-title">Mes congés</h2>
  <app-leave-counter />
</section>

<section aria-labelledby="team-title">
  <h2 id="team-title">L'équipe</h2>
  <app-employee-card />
  <app-employee-card />
</section>
```

7. Donnez un contenu provisoire à la carte, dans `src/app/employee-card/employee-card.html` :

```html
<article class="card">
  <h3>Claire Martin</h3>
  <p>Développeuse front-end</p>
</article>
```

### Vérifier

- Le compteur fonctionne exactement comme avant : l'utilisateur ne voit aucune différence.
- La même carte "Claire Martin" s'affiche deux fois : un composant se réutilise autant de fois qu'on veut.
- Retirez `EmployeeCard` du tableau `imports` de `App` : le terminal affiche `'app-employee-card' is not a known element`. Remettez-le.

---

## Module 9 - Les entrées de composant avec `input()` (20 min)

### La notion

Une carte qui affiche toujours "Claire Martin" n'est pas très utile. Une **entrée** (`input`) permet au parent de **donner une valeur** à l'enfant, comme un attribut HTML : `<app-employee-card [employee]="claire" />`.

Dans l'enfant, l'entrée est un signal en lecture seule : on la lit avec `employee()`.

### Pas à pas

1. Décrivez d'abord la forme d'un collègue avec une **interface** TypeScript :

```bash
ng generate interface models/employee
```

`src/app/models/employee.ts` :

```ts
// Forme d'un collègue : chaque objet Employee doit avoir ces propriétés.
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  job: string;
  department: string;
  remote: boolean;
}
```

2. `src/app/employee-card/employee-card.ts` :

```ts
import { Component, input } from '@angular/core';
import { Employee } from '../models/employee';

@Component({
  imports: [],
  selector: 'app-employee-card',
  styleUrl: './employee-card.css',
  templateUrl: './employee-card.html',
})
export class EmployeeCard {
  // Donnée reçue du parent : <app-employee-card [employee]="..." />
  // required : le parent est OBLIGÉ de la fournir.
  readonly employee = input.required<Employee>();
}
```

3. `src/app/employee-card/employee-card.html` :

```html
<article class="card">
  <h3 class="card__name">{{ employee().firstName }} {{ employee().lastName }}</h3>
  <p class="card__job">{{ employee().job }}</p>
  <p>{{ employee().department }}</p>
  <!-- Liaison de propriete : l'adresse du lien est construite a partir des donnees. -->
  <a [href]="'mailto:' + employee().email">{{ employee().email }}</a>
</article>
```

4. Dans `src/app/app.ts`, importez l'interface et ajoutez deux collègues dans la classe `App` :

```ts
import { Employee } from './models/employee';
```

```ts
  protected readonly claire: Employee = {
    id: 1,
    firstName: 'Claire',
    lastName: 'Martin',
    email: 'claire.martin@techcorp.fr',
    job: 'Développeuse front-end',
    department: 'Informatique',
    remote: true,
  };

  protected readonly julien: Employee = {
    id: 2,
    firstName: 'Julien',
    lastName: 'Bernard',
    email: 'julien.bernard@techcorp.fr',
    job: 'Chef de projet',
    department: 'Informatique',
    remote: false,
  };
```

5. Dans `src/app/app.html`, transmettez-les aux cartes :

```html
<app-employee-card [employee]="claire" /> <app-employee-card [employee]="julien" />
```

### Vérifier

- Deux cartes différentes s'affichent, avec un lien e-mail cliquable.
- Supprimez `[employee]="julien"` : le terminal affiche `Required input 'employee' from component EmployeeCard must be specified`. Remettez-le.
- Dans `claire`, supprimez la ligne `remote: true` : erreur, la propriété est obligatoire dans l'interface. Remettez-la.

---

## Module 10 - Styliser les composants (15 min)

### La notion

Les styles d'un composant (`employee-card.css`) ne s'appliquent **qu'à ce composant** : c'est l'**encapsulation**. Une classe `.card` dans un autre composant ne sera pas touchée. Les styles globaux, eux, vont dans `src/styles.css`.

Le sélecteur spécial `:host` désigne la balise du composant elle-même (`<app-employee-card>`).

### Pas à pas

1. `src/app/employee-card/employee-card.css` :

```css
/* :host designe la balise du composant elle-meme, <app-employee-card>.
   Par defaut, une balise inconnue est "inline" : on la passe en bloc. */
:host {
  display: block;
}

/* Ces styles ne s'appliquent qu'a ce composant. */
.card {
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #ffffff;
}

.card__name {
  margin: 0;
  font-size: 1.125rem;
}

.card__job {
  margin: 0.25rem 0;
  color: #4b5563;
}
```

2. Dans `src/app/app.html`, ajoutez une balise `<p class="card">Test</p>` sous les cartes.

### Vérifier

- Les cartes ont une bordure et des coins arrondis.
- Le paragraphe "Test" de `App` n'a **pas** de bordure, alors qu'il porte la classe `card` : les styles de `EmployeeCard` restent dans `EmployeeCard`.
- Inspectez une carte : Angular a ajouté des attributs du type `_ngcontent-abc-c12` aux éléments, et le CSS a été réécrit avec ces attributs. C'est ainsi qu'il isole les styles.
- Supprimez le paragraphe "Test".

---

## Module 11 - Afficher une liste avec `@for` (15 min)

### La notion

Écrire une balise par collègue ne fonctionne pas quand la liste change. `@for` **répète** un morceau de template pour chaque élément d'un tableau.

`track` indique à Angular comment reconnaître chaque élément (ici, par son `id`) : quand la liste change, il ne recrée que ce qui a changé. `@empty` s'affiche si le tableau est vide.

### Pas à pas

1. Dans `src/app/app.ts`, remplacez `claire` et `julien` par un tableau de trois collègues :

```ts
  protected readonly employees: Employee[] = [
    {
      id: 1,
      firstName: 'Claire',
      lastName: 'Martin',
      email: 'claire.martin@techcorp.fr',
      job: 'Développeuse front-end',
      department: 'Informatique',
      remote: true,
    },
    {
      id: 2,
      firstName: 'Julien',
      lastName: 'Bernard',
      email: 'julien.bernard@techcorp.fr',
      job: 'Chef de projet',
      department: 'Informatique',
      remote: false,
    },
    {
      id: 3,
      firstName: 'Sarah',
      lastName: 'Lefèvre',
      email: 'sarah.lefevre@techcorp.fr',
      job: 'Chargée RH',
      department: 'Ressources humaines',
      remote: false,
    },
  ];
```

2. Dans `src/app/app.html`, la section "L'équipe" devient une vraie liste HTML :

```html
<section aria-labelledby="team-title">
  <h2 id="team-title">L'équipe</h2>

  <ul class="team">
    @for (employee of employees; track employee.id) {
    <li>
      <app-employee-card [employee]="employee" />
    </li>
    } @empty {
    <li>Aucun collègue pour le moment.</li>
    }
  </ul>
</section>
```

Un lecteur d'écran annonce "liste, 3 éléments" : la structure `<ul>` / `<li>` est une information utile.

3. Dans `src/app/app.css`, disposez les cartes en grille, en pensant **mobile d'abord** :

```css
/* Mobile d'abord : une colonne, puis une grille sur les écrans plus larges. */
.team {
  display: grid;
  gap: 1rem;
  padding: 0;
  list-style: none;
}

@media (min-width: 40rem) {
  .team {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 64rem) {
  .team {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Vérifier

- Trois cartes s'affichent : sur une colonne en vue mobile (DevTools, `Ctrl + Shift + M`), sur deux ou trois colonnes en plein écran.
- Ajoutez un quatrième collègue dans le tableau : une carte apparaît sans toucher au template.
- Remplacez temporairement le tableau par `[]` : le message `@empty` s'affiche. Annulez.

---

## Module 12 - Afficher sous condition avec `@if` (15 min)

### La notion

`@if (condition) { ... }` affiche un bloc seulement si la condition est vraie. `@else { ... }` affiche une alternative. Le bloc non affiché n'existe **pas du tout** dans la page (ce n'est pas un simple `display: none`).

### Pas à pas

1. Dans `src/app/employee-card/employee-card.html`, ajoutez à la fin de l'`<article>` :

```html
@if (employee().remote) {
<p class="badge badge--remote">En télétravail</p>
} @else {
<p class="badge">Sur site</p>
}
```

2. Dans `src/app/employee-card/employee-card.css`, ajoutez :

```css
.badge {
  display: inline-block;
  margin: 0.5rem 0 0;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  background-color: #e5e7eb;
  font-size: 0.875rem;
}

.badge--remote {
  background-color: #dbeafe;
  color: #1e3a8a;
}
```

Le badge contient du **texte** ("En télétravail") : l'information ne repose pas seulement sur la couleur (critère WCAG 1.4.1).

### Vérifier

- Claire a le badge bleu "En télétravail", Julien et Sarah ont "Sur site".
- Inspectez la carte de Julien : il n'y a aucune trace du badge "En télétravail" dans le HTML.

---

## Défis de la phase 3

### Intermédiaire

1. Créez un composant `StatusBadge` avec une entrée `remote = input.required<boolean>()`, qui affiche le badge. Utilisez-le dans `EmployeeCard` à la place du `@if`.
2. Affichez sous la liste "3 collègues, dont 1 en télétravail".

Indices : pour le nombre en télétravail, transformez `employees` en signal (`signal<Employee[]>([...])`), puis créez un `computed` avec `filter((e) => e.remote).length`. Pensez à lire `employees()` avec des parenthèses dans le `@for`.

### Avancé

1. Ajoutez à `EmployeeCard` une entrée **optionnelle** `compact = input(false)`. En mode compact, seuls le nom et le poste sont affichés. Utilisez-la sur la première carte uniquement.
2. Affichez des initiales dans un cercle ("CM" pour Claire Martin) grâce à un `computed` dans `EmployeeCard`. Le cercle est décoratif : masquez-le aux lecteurs d'écran (`aria-hidden="true"`).
3. Dans le `@for`, affichez la position de chaque collègue ("1 / 3") avec les variables `$index` et `$count`.

---

# Phase 4 - Architecture

## Module 13 - La liaison bidirectionnelle (20 min)

### La notion

Jusqu'ici, les données circulent dans un seul sens :

- `[entree]` : du parent vers l'enfant
- `(evenement)` : de l'enfant (ou du HTML) vers la classe

La **liaison bidirectionnelle** `[( )]` combine les deux : la valeur descend vers l'enfant **et** remonte quand l'enfant la modifie. Moyen mnémotechnique : "la banane dans la boîte", `[(...)]`.

Côté enfant, on la déclare avec `model()` : un signal que l'enfant peut **lire et modifier**.

### Pas à pas

1. Générez un champ de recherche réutilisable :

```bash
ng generate component search-box
```

2. `src/app/search-box/search-box.ts` :

```ts
import { Component, model } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-search-box',
  styleUrl: './search-box.css',
  templateUrl: './search-box.html',
})
export class SearchBox {
  // model() : une valeur que le parent peut lire ET que ce composant peut modifier.
  readonly query = model('');
}
```

3. `src/app/search-box/search-box.html` :

```html
<label for="search">Rechercher un collègue</label>
<!-- #searchInput : une variable de template qui designe ce champ.
     A chaque frappe, on recopie sa valeur dans le model. -->
<input
  #searchInput
  id="search"
  type="search"
  [value]="query()"
  (input)="query.set(searchInput.value)"
/>
```

Le `<label for="search">` est relié au champ par son `id` : un clic sur le texte place le curseur dans le champ, et le lecteur d'écran annonce "Rechercher un collègue".

4. `src/app/search-box/search-box.css` :

```css
:host {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 24rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #6b7280;
  border-radius: 0.25rem;
  font: inherit;
}
```

5. Dans `src/app/app.ts` (si vous avez fait le défi intermédiaire de la phase 3, `employees` est un signal : écrivez `this.employees()` dans le code ci-dessous) :
   - ajoutez `computed` à l'import de `@angular/core` ;
   - importez `SearchBox` et ajoutez-le au tableau `imports` ;
   - ajoutez dans la classe un signal `search` et un `computed` qui filtre les collègues :

```ts
  protected readonly search = signal('');

  protected readonly filteredEmployees = computed(() => {
    const text = this.search().trim().toLowerCase();
    return this.employees.filter((employee) =>
      (employee.firstName + ' ' + employee.lastName).toLowerCase().includes(text),
    );
  });
```

6. Dans `src/app/app.html`, section "L'équipe" :

```html
<section aria-labelledby="team-title">
  <h2 id="team-title">L'équipe</h2>

  <!-- [( )] : la recherche circule dans les deux sens entre App et SearchBox. -->
  <app-search-box [(query)]="search" />

  <p aria-live="polite">{{ filteredEmployees().length }} collègue(s) affiché(s)</p>

  <ul class="team">
    @for (employee of filteredEmployees(); track employee.id) {
    <li>
      <app-employee-card [employee]="employee" />
    </li>
    } @empty {
    <li>Aucun collègue ne correspond à « {{ search() }} ».</li>
    }
  </ul>
</section>
```

### Vérifier

- Tapez "jul" : seule la carte de Julien reste. Le compteur indique "1 collègue(s) affiché(s)".
- Tapez "zzz" : le message `@empty` reprend votre recherche.
- `filteredEmployees` est un `computed` : il se recalcule tout seul à chaque frappe, sans aucun code de "rafraîchissement".

---

## Module 14 - Les services et l'injection de dépendances (20 min)

### La notion

Pour l'instant, la liste des collègues vit dans `App`. Dès qu'une autre page en aura besoin (module 15), il faudra la **partager**. Un **service** est une classe qui contient des données ou de la logique partagées.

L'**injection de dépendances** : un composant ne crée pas le service lui-même (`new TeamStore()`), il le **demande** à Angular avec `inject(TeamStore)`. Angular crée **une seule instance** et la donne à tous ceux qui la demandent : tous voient les mêmes données.

### Pas à pas

1. Générez le service :

```bash
ng generate service team-store
```

2. `src/app/team-store.ts` :

```ts
import { Service, signal } from '@angular/core';
import { Employee } from './models/employee';

// @Service() : Angular crée une seule instance, partagée par toute l'application.
@Service()
export class TeamStore {
  // private : seul le service peut modifier la liste.
  private readonly employeesSignal = signal<Employee[]>([
    // Collez ici les trois collègues du tableau employees de App.
  ]);

  // Version en lecture seule pour les composants.
  readonly employees = this.employeesSignal.asReadonly();

  // Prochain identifiant libre : 3 collègues au départ.
  private nextId = 4;

  // Omit<Employee, 'id'> : un Employee sans id, c'est le service qui le choisit.
  add(employee: Omit<Employee, 'id'>): void {
    const newEmployee: Employee = { ...employee, id: this.nextId++ };
    this.employeesSignal.update((list) => [...list, newEmployee]);
  }

  remove(id: number): void {
    this.employeesSignal.update((list) => list.filter((employee) => employee.id !== id));
  }
}
```

3. **Déplacez** les trois collègues du tableau `employees` de `App` vers le `signal<Employee[]>([...])` du service, puis supprimez la propriété `employees` de `App`.
4. Dans `src/app/app.ts` :
   - ajoutez `inject` à l'import de `@angular/core` ;
   - importez `TeamStore` : `import { TeamStore } from './team-store';` ;
   - l'import de `Employee` n'est plus utile, supprimez-le ;
   - dans la classe, demandez le service et utilisez-le :

```ts
  // inject() : Angular fournit l'instance unique du service.
  private readonly store = inject(TeamStore);

  protected readonly search = signal('');

  protected readonly filteredEmployees = computed(() => {
    const text = this.search().trim().toLowerCase();
    // employees est maintenant un signal : on le lit avec ().
    return this.store
      .employees()
      .filter((employee) =>
        (employee.firstName + ' ' + employee.lastName).toLowerCase().includes(text),
      );
  });

  protected remove(id: number): void {
    this.store.remove(id);
  }
```

5. Dans `src/app/app.html`, ajoutez un bouton "Retirer" dans chaque `<li>`, sous la carte :

```html
<li>
  <app-employee-card [employee]="employee" />
  <!-- aria-label : sans lui, le lecteur d'ecran annonce trois boutons "Retirer"
             sans dire lequel retire qui. -->
  <button
    type="button"
    class="remove"
    [attr.aria-label]="'Retirer ' + employee.firstName + ' ' + employee.lastName"
    (click)="remove(employee.id)"
  >
    Retirer
  </button>
</li>
```

6. Dans `src/app/app.css` :

```css
.remove {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid #b91c1c;
  border-radius: 0.25rem;
  background: none;
  color: #b91c1c;
  font: inherit;
  cursor: pointer;
}
```

### Vérifier

- La liste s'affiche comme avant : les données viennent maintenant du service.
- "Retirer" supprime la carte et le compteur se met à jour. Rechargez la page (`F5`) : les collègues reviennent, car les données ne sont qu'en mémoire (une vraie API arrive au jour 4).

---

## Module 15 - Le routage (25 min)

### La notion

Une application a plusieurs **pages**, mais une seule page HTML (`index.html`). Le **routeur** associe une adresse à un composant, et l'affiche dans `<router-outlet />` sans recharger la page.

| Adresse    | Page                                           |
| ---------- | ---------------------------------------------- |
| `/`        | `Home` : accueil, statut et compteur de congés |
| `/equipe`  | `TeamPage` : annuaire et recherche             |
| `/ajouter` | `AddEmployee` : formulaire (module 16)         |

`App` devient la **coquille** : un en-tête avec la navigation, et la zone où s'affichent les pages.

### Pas à pas

1. Générez les trois pages :

```bash
ng generate component pages/home
ng generate component pages/team-page
ng generate component pages/add-employee
```

2. **Page d'accueil** : `src/app/pages/home/home.ts` reprend le message, le statut et le compteur :

```ts
import { Component, signal } from '@angular/core';
import { LeaveCounter } from '../../leave-counter/leave-counter';

type Status = 'sur site' | 'en télétravail' | 'absent';

@Component({
  imports: [LeaveCounter],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  protected readonly userName = 'Claire';
  protected message = '';

  protected readonly status = signal<Status>('sur site');

  protected sayHello(): void {
    this.message = 'Bienvenue dans TechCorp Équipe, ' + this.userName + ' !';
  }

  protected changeStatus(newStatus: Status): void {
    this.status.set(newStatus);
  }
}
```

3. `src/app/pages/home/home.html` : **coupez** dans `app.html` tout ce qui se trouve entre le `<h1>` et la section "L'équipe" (les paragraphes, le bouton "Dire bonjour", le message, les sections "Mon statut aujourd'hui" et "Mes congés"), et collez-le ici. Puis remplacez le paragraphe `<p>Bonjour {{ userName }}</p>` par un titre :

```html
<h1>Bonjour {{ userName }}</h1>
```

Chaque page a son propre `<h1>` : c'est le premier titre que le lecteur d'écran et les moteurs de recherche lisent.

4. Déplacez la règle `[aria-pressed='true']` de `app.css` vers `src/app/pages/home/home.css`.
5. **Page équipe** : `src/app/pages/team-page/team-page.ts` reprend la recherche et le service :

```ts
import { Component, computed, inject, signal } from '@angular/core';
import { EmployeeCard } from '../../employee-card/employee-card';
import { SearchBox } from '../../search-box/search-box';
import { TeamStore } from '../../team-store';

@Component({
  imports: [EmployeeCard, SearchBox],
  selector: 'app-team-page',
  styleUrl: './team-page.css',
  templateUrl: './team-page.html',
})
export class TeamPage {
  // inject() : Angular fournit l'instance unique du service.
  private readonly store = inject(TeamStore);

  protected readonly search = signal('');

  protected readonly filteredEmployees = computed(() => {
    const text = this.search().trim().toLowerCase();
    return this.store
      .employees()
      .filter((employee) =>
        (employee.firstName + ' ' + employee.lastName).toLowerCase().includes(text),
      );
  });

  protected remove(id: number): void {
    this.store.remove(id);
  }
}
```

6. `src/app/pages/team-page/team-page.html` : coupez le **contenu** de la section "L'équipe" de `app.html` (la recherche, le compteur, la liste), collez-le ici et remplacez le `<h2>` par un `<h1>L'équipe</h1>`. Déplacez les règles `.team`, les deux `@media` et `.remove` de `app.css` vers `team-page.css`.
7. **La coquille** : `src/app/app.ts` ne garde que le nom de l'application :

```ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly appName = 'TechCorp Équipe';
}
```

8. `src/app/app.html` :

```html
<header class="header">
  <span class="app-name">{{ appName }}</span>
  <nav aria-label="Navigation principale">
    <!-- routerLink : change de page sans recharger.
         routerLinkActive : ajoute la classe "active" au lien de la page affichee.
         ariaCurrentWhenActive : annonce "page actuelle" au lecteur d'ecran. -->
    <a
      routerLink="/"
      routerLinkActive="active"
      [routerLinkActiveOptions]="{ exact: true }"
      ariaCurrentWhenActive="page"
    >
      Accueil
    </a>
    <a routerLink="/equipe" routerLinkActive="active" ariaCurrentWhenActive="page">Équipe</a>
    <a routerLink="/ajouter" routerLinkActive="active" ariaCurrentWhenActive="page">Ajouter</a>
  </nav>
</header>

<main class="container">
  <!-- La page correspondant a l'adresse s'affiche ici. -->
  <router-outlet />
</main>
```

`{ exact: true }` : sans lui, le lien "Accueil" (`/`) serait actif sur toutes les pages, car toutes les adresses commencent par `/`.

9. `src/app/app.css` (remplacez tout le contenu) :

```css
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #d1d5db;
}

.app-name {
  margin-right: auto;
  font-weight: 700;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.active {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

.container {
  max-width: 64rem;
  margin: 0 auto;
}
```

10. Déclarez les routes dans `src/app/app.routes.ts` :

```ts
import { Routes } from '@angular/router';
import { AddEmployee } from './pages/add-employee/add-employee';
import { Home } from './pages/home/home';
import { TeamPage } from './pages/team-page/team-page';

export const routes: Routes = [
  // title : le titre de l'onglet, différent pour chaque page.
  { path: '', title: 'Accueil | TechCorp Équipe', component: Home },
  { path: 'equipe', title: 'Équipe | TechCorp Équipe', component: TeamPage },
  {
    path: 'ajouter',
    title: 'Ajouter un collègue | TechCorp Équipe',
    component: AddEmployee,
  },
  // Toute autre adresse renvoie vers l'accueil. Toujours en dernier.
  { path: '**', redirectTo: '' },
];
```

Les routes sont déjà branchées dans `src/app/app.config.ts` par `provideRouter(routes)` : il n'y a rien à ajouter.

### Vérifier

- Les trois liens changent de page, l'adresse change dans la barre du navigateur, et la page **ne se recharge pas** (onglet Network des DevTools).
- Le titre de l'onglet change à chaque page. Le lien de la page affichée est en gras, et l'inspecteur montre `aria-current="page"`.
- Retirez un collègue sur `/equipe`, allez sur l'accueil, revenez : il est toujours retiré. Le service a gardé les données entre les pages.
- Tapez http://localhost:4200/nimportequoi : vous revenez sur l'accueil.
- Les boutons "Précédent" et "Suivant" du navigateur fonctionnent.

---

## Module 16 - Premier formulaire (20 min)

### La notion

Pour ajouter un collègue, il faut un **formulaire**. Ce premier formulaire utilise `FormsModule` et la directive `ngModel` : `[(ngModel)]="firstName"` est une liaison bidirectionnelle (module 13) entre un champ et un signal. Ce que l'utilisateur tape arrive dans le signal, et inversement.

`(ngSubmit)` est appelé quand l'utilisateur envoie le formulaire : clic sur le bouton `type="submit"` ou touche `Entrée`.

### Pas à pas

1. `src/app/pages/add-employee/add-employee.ts` :

```ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamStore } from '../../team-store';

@Component({
  imports: [FormsModule],
  selector: 'app-add-employee',
  styleUrl: './add-employee.css',
  templateUrl: './add-employee.html',
})
export class AddEmployee {
  private readonly store = inject(TeamStore);
  // Le routeur permet de changer de page depuis le code.
  private readonly router = inject(Router);

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly email = signal('');
  protected readonly job = signal('');

  protected save(): void {
    this.store.add({
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      job: this.job(),
      department: 'Informatique',
      remote: false,
    });
    this.router.navigate(['/equipe']);
  }
}
```

2. `src/app/pages/add-employee/add-employee.html` :

```html
<h1>Ajouter un collègue</h1>

<!-- (ngSubmit) : appele au clic sur le bouton submit ou avec la touche Entree. -->
<form class="form" (ngSubmit)="save()">
  <div class="field">
    <label for="first-name">Prénom</label>
    <!-- name : obligatoire avec ngModel dans un formulaire. -->
    <input id="first-name" name="firstName" [(ngModel)]="firstName" />
  </div>

  <div class="field">
    <label for="last-name">Nom</label>
    <input id="last-name" name="lastName" [(ngModel)]="lastName" />
  </div>

  <div class="field">
    <label for="email">E-mail</label>
    <input id="email" name="email" type="email" [(ngModel)]="email" />
  </div>

  <div class="field">
    <label for="job">Poste</label>
    <input id="job" name="job" [(ngModel)]="job" />
  </div>

  <p>Aperçu : {{ firstName() }} {{ lastName() }}, {{ job() }}</p>

  <button type="submit">Ajouter</button>
</form>
```

3. `src/app/pages/add-employee/add-employee.css` :

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 32rem;
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
```

### Vérifier

- L'aperçu se met à jour à chaque frappe : c'est la liaison bidirectionnelle.
- Remplissez le formulaire et cliquez sur "Ajouter" : vous arrivez sur `/equipe` et le nouveau collègue est dans la liste.
- Envoyez le formulaire **vide** : un collègue sans nom est ajouté. Il manque une validation : elle arrive en phase 5, avec un outil plus moderne.

---

## Module 17 - Introduction à Angular Material (20 min)

### La notion

**Angular Material** est la bibliothèque officielle de composants d'interface d'Angular : boutons, barres d'outils, cartes, champs, boîtes de dialogue... Ils sont accessibles (clavier, ARIA) et cohérents visuellement. On importe dans chaque composant **uniquement** les éléments utilisés.

### Pas à pas

1. Arrêtez le serveur (`Ctrl + C`), installez Material, puis relancez :

```bash
ng add @angular/material
npm start
```

Acceptez les choix proposés par défaut. La commande installe le paquet, crée un thème (`src/material-theme.scss`) et ajoute les polices dans `index.html`.

2. **La barre d'outils** : dans `src/app/app.ts`, importez `MatToolbar` et `MatButton` :

```ts
import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [MatButton, MatToolbar, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly appName = 'TechCorp Équipe';
}
```

3. Dans `src/app/app.html`, remplacez le `<header>` :

```html
<header>
  <mat-toolbar>
    <span class="app-name">{{ appName }}</span>
    <nav aria-label="Navigation principale">
      <a
        matButton
        routerLink="/"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        ariaCurrentWhenActive="page"
      >
        Accueil
      </a>
      <a matButton routerLink="/equipe" routerLinkActive="active" ariaCurrentWhenActive="page">
        Équipe
      </a>
      <a matButton routerLink="/ajouter" routerLinkActive="active" ariaCurrentWhenActive="page">
        Ajouter
      </a>
    </nav>
  </mat-toolbar>
</header>
```

4. Dans `src/app/app.css`, supprimez la règle `.header` et ajoutez :

```css
/* Sur mobile, la navigation passe a la ligne au lieu de deborder. */
mat-toolbar {
  flex-wrap: wrap;
  gap: 0.5rem;
  height: auto;
  min-height: 64px;
}
```

Le thème Material fixe déjà la marge du `body` : supprimez `margin: 0;` et `padding: 1rem;` de `src/styles.css`, et ajoutez `padding: 1rem;` à la règle `.container` de `app.css`.

5. **Des boutons Material** : dans `src/app/leave-counter/leave-counter.ts`, importez les éléments utilisés :

```ts
import { Component, computed, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
  imports: [MatButton, MatCard, MatCardContent, MatCardHeader, MatCardTitle],
  selector: 'app-leave-counter',
  styleUrl: './leave-counter.css',
  templateUrl: './leave-counter.html',
})
```

Le reste de la classe ne change pas.

6. `src/app/leave-counter/leave-counter.html` : le compteur devient une carte Material.

```html
<mat-card appearance="outlined">
  <mat-card-header>
    <mat-card-title>Solde</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <p>Jours posés : {{ daysTaken() }}</p>
    <p aria-live="polite" [class.counter--empty]="isEmpty()">
      Jours restants : {{ remainingDays() }} / {{ totalDays }}
    </p>

    <div class="counter__actions">
      <!-- matButton="filled" : bouton plein, l'action principale. -->
      <button matButton="filled" type="button" [disabled]="isEmpty()" (click)="addDay()">
        Poser un jour
      </button>
      <button
        matButton="outlined"
        type="button"
        [disabled]="daysTaken() === 0"
        (click)="removeDay()"
      >
        Annuler un jour
      </button>
      <!-- matButton sans valeur : bouton texte, l'action secondaire. -->
      <button matButton type="button" (click)="reset()">Remettre à zéro</button>
    </div>
  </mat-card-content>
</mat-card>
```

7. Dans `src/app/leave-counter/leave-counter.css`, ajoutez :

```css
.counter__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

8. Sur la page d'accueil, utilisez `matButton="tonal"` pour "Dire bonjour" et `matButton="outlined"` pour les boutons de statut (n'oubliez pas `MatButton` dans les `imports` de `Home`).

### Vérifier

- L'en-tête est une barre d'outils Material, les boutons ont le style Material avec un effet d'ondulation au clic.
- Naviguez au clavier avec `Tab` : chaque bouton et chaque lien affiche un contour de focus.
- En vue mobile (375 px de large), la navigation passe à la ligne et rien ne déborde horizontalement.

---

## Défis de la phase 4

### Intermédiaire

1. Ajoutez une page "Fiche collègue" à l'adresse `/equipe/:id`. Un clic sur le nom d'un collègue y mène et affiche ses informations.
2. Si l'identifiant n'existe pas, affichez "Collègue introuvable" et un lien de retour vers l'équipe.

Indices :

- route `{ path: 'equipe/:id', component: EmployeeDetail }` ;
- dans `app.config.ts`, `provideRouter(routes, withComponentInputBinding())` : le paramètre `id` arrive alors dans une entrée `id = input.required<string>()` ;
- dans `TeamStore`, une méthode `findById(id: number)` qui utilise `find` ;
- `Number(this.id())` pour convertir le texte en nombre.

### Avancé

1. Ajoutez au service un `computed` `remoteCount` et affichez "dont N en télétravail" dans l'en-tête de la page équipe.
2. Ajoutez un filtre par service (`<select>`), combiné avec la recherche texte. Le filtre doit vivre dans `TeamPage`, pas dans le service.
3. Chargez la page "Ajouter" à la demande (`loadComponent`) et constatez dans le terminal qu'un nouveau fichier JavaScript (lazy chunk) est créé.
4. Remplacez le bouton "Retirer" par un `MatIconButton` avec l'icône `delete` (`<mat-icon>`). Gardez un nom accessible.

---

# Phase 5 - Les Signal Forms

## Module 18 - Introduction aux Signal Forms (20 min)

### La notion

Le formulaire du module 16 a deux défauts : un signal par champ, et aucune validation. Les **Signal Forms** (`@angular/forms/signals`) sont la manière moderne de construire des formulaires avec Angular :

1. **Le modèle** : un seul signal qui contient toutes les valeurs du formulaire.
2. **Le formulaire** : `form(modele)` construit un **arbre de champs**, un par propriété du modèle.
3. **La liaison** : `[formField]="employeeForm.firstName"` relie un `<input>` à son champ, dans les deux sens.

### Pas à pas

1. Remplacez **tout** le contenu de `src/app/pages/add-employee/add-employee.ts` :

```ts
import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { TeamStore } from '../../team-store';

// Le modèle du formulaire : une propriété par champ.
interface EmployeeDraft {
  firstName: string;
  lastName: string;
  email: string;
  job: string;
  department: string;
  remote: boolean;
}

// Les valeurs de départ, réutilisées pour vider le formulaire (module 19).
const EMPTY_DRAFT: EmployeeDraft = {
  firstName: '',
  lastName: '',
  email: '',
  job: '',
  department: 'Informatique',
  remote: false,
};

@Component({
  imports: [FormField, MatButton],
  selector: 'app-add-employee',
  styleUrl: './add-employee.css',
  templateUrl: './add-employee.html',
})
export class AddEmployee {
  private readonly store = inject(TeamStore);
  private readonly router = inject(Router);

  protected readonly departments = ['Informatique', 'Ressources humaines', 'Commercial'];

  // 1. Le modèle : un signal qui contient toutes les valeurs du formulaire.
  //    { ...EMPTY_DRAFT } : une copie, pour ne jamais modifier EMPTY_DRAFT.
  private readonly draft = signal<EmployeeDraft>({ ...EMPTY_DRAFT });

  // 2. Le formulaire : un champ par propriété du modèle.
  protected readonly employeeForm = form(this.draft);
}
```

2. Remplacez **tout** le contenu de `src/app/pages/add-employee/add-employee.html` :

```html
<h1>Ajouter un collègue</h1>

<form class="form">
  <div class="field">
    <label for="first-name">Prénom</label>
    <!-- [formField] : relie le champ au formulaire, dans les deux sens. -->
    <input id="first-name" [formField]="employeeForm.firstName" />
  </div>

  <div class="field">
    <label for="last-name">Nom</label>
    <input id="last-name" [formField]="employeeForm.lastName" />
  </div>

  <div class="field">
    <label for="email">E-mail</label>
    <input id="email" type="email" [formField]="employeeForm.email" />
  </div>

  <div class="field">
    <label for="job">Poste</label>
    <input id="job" [formField]="employeeForm.job" />
  </div>

  <div class="field">
    <label for="department">Service</label>
    <select id="department" [formField]="employeeForm.department">
      @for (department of departments; track department) {
      <option [value]="department">{{ department }}</option>
      }
    </select>
  </div>

  <!-- Une case a cocher se relie a un booleen. -->
  <div class="field field--inline">
    <input id="remote" type="checkbox" [formField]="employeeForm.remote" />
    <label for="remote">En télétravail</label>
  </div>

  <!-- employeeForm.firstName() : l'ETAT du champ. .value() : sa valeur. -->
  <p>
    Aperçu : {{ employeeForm.firstName().value() }} {{ employeeForm.lastName().value() }}, {{
    employeeForm.job().value() }} ({{ employeeForm.department().value() }})
  </p>
</form>
```

Il n'y a plus de bouton d'envoi : il revient au module 19.

3. Dans `src/app/pages/add-employee/add-employee.css`, ajoutez :

```css
/* La case a cocher et son libelle sur la meme ligne. */
.field--inline {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
```

### Vérifier

- L'aperçu se met à jour quand vous tapez, choisissez un service ou cochez la case.
- Le code est plus court qu'au module 16 : un seul signal `draft`, plus de `name`, plus de `FormsModule`.
- Lisez la différence de syntaxe :
  - `employeeForm.firstName` (sans parenthèses) : le **champ**, à donner à `[formField]` ;
  - `employeeForm.firstName()` (avec parenthèses) : son **état** (valeur, erreurs, touché...).

---

## Module 19 - Envoyer et réinitialiser (20 min)

### La notion

La directive `[formRoot]` se place sur la balise `<form>`. À l'envoi, elle empêche le rechargement de la page puis appelle l'**action de soumission** déclarée dans `form()`.

Pour **vider** le formulaire, `employeeForm().reset(valeurs)` remet les valeurs de départ **et** efface l'état des champs (touché, modifié).

### Pas à pas

1. Dans `add-employee.ts`, importez `FormRoot` et ajoutez-le aux `imports` du composant :

```ts
import { FormField, FormRoot, form } from '@angular/forms/signals';
```

```ts
  imports: [FormField, FormRoot, MatButton],
```

2. Remplacez la déclaration de `employeeForm`, puis ajoutez deux méthodes sous elle :

```ts
  protected readonly employeeForm = form(this.draft, {
    // 3. L'action de soumission : appelée à l'envoi du formulaire.
    //    async : elle pourrait attendre une réponse d'API (jour 4).
    submission: {
      action: async () => this.save(),
    },
  });

  protected resetForm(): void {
    // reset() remet les valeurs ET efface l'état "touché" des champs.
    this.employeeForm().reset({ ...EMPTY_DRAFT });
  }

  private async save(): Promise<void> {
    this.store.add(this.draft());
    this.resetForm();
    await this.router.navigate(['/equipe']);
  }
```

3. Dans `add-employee.html`, ajoutez `[formRoot]` sur la balise `<form>` :

```html
<form class="form" [formRoot]="employeeForm"></form>
```

4. Remplacez le paragraphe "Aperçu" par les boutons :

```html
<div class="form__actions">
  <button matButton="filled" type="submit">Ajouter</button>
  <!-- type="button" : ce bouton n'envoie PAS le formulaire. -->
  <button matButton="outlined" type="button" (click)="resetForm()">Effacer</button>
</div>
```

5. Dans `add-employee.css` :

```css
.form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

### Vérifier

- Remplissez puis cliquez sur "Effacer" : tous les champs reviennent à leur valeur de départ.
- Remplissez puis cliquez sur "Ajouter" (ou `Entrée` dans un champ) : vous arrivez sur `/equipe` avec le nouveau collègue, son service et son badge de télétravail.
- Revenez sur "Ajouter" : le formulaire est vide.
- Le formulaire vide s'envoie toujours : la validation arrive au module 20.

---

## Module 20 - La validation (20 min)

### La notion

Les règles de validation se déclarent dans un **schéma** : une fonction passée en deuxième argument de `form()`. Elle reçoit `path`, le chemin vers chaque champ, et on y appelle les validateurs fournis par Angular.

| Validateur              | Règle                 |
| ----------------------- | --------------------- |
| `required(path.x)`      | Champ obligatoire     |
| `minLength(path.x, 2)`  | Au moins 2 caractères |
| `maxLength(path.x, 40)` | Au plus 40 caractères |
| `email(path.x)`         | Adresse e-mail valide |

Avec `[formRoot]`, l'action de soumission n'est appelée **que si le formulaire est valide**.

### Pas à pas

1. Dans `add-employee.ts`, complétez l'import :

```ts
import {
  FormField,
  FormRoot,
  email,
  form,
  maxLength,
  minLength,
  required,
} from '@angular/forms/signals';
```

2. Ajoutez le schéma entre le modèle et les options :

```ts
  protected readonly employeeForm = form(
    this.draft,
    // Le schéma : les règles de validation de chaque champ.
    (path) => {
      required(path.firstName, { message: 'Le prénom est obligatoire.' });
      required(path.lastName, { message: 'Le nom est obligatoire.' });
      minLength(path.lastName, 2, { message: 'Le nom doit contenir au moins 2 lettres.' });
      required(path.email, { message: "L'e-mail est obligatoire." });
      email(path.email, {
        message: "L'e-mail n'est pas valide (exemple : prenom.nom@techcorp.fr).",
      });
      required(path.job, { message: 'Le poste est obligatoire.' });
      maxLength(path.job, 40, { message: 'Le poste ne doit pas dépasser 40 caractères.' });
    },
    {
      submission: {
        action: async () => this.save(),
      },
    },
  );
```

Chaque message est rédigé pour l'utilisateur : il dit **quoi corriger**, pas seulement "invalide".

3. Pour observer la validation, ajoutez provisoirement à la fin du `<form>` dans `add-employee.html` :

```html
<p>Formulaire valide : {{ employeeForm().valid() }}</p>
```

### Vérifier

- Formulaire vide : "Formulaire valide : false". Cliquez sur "Ajouter" : **rien ne se passe**, vous restez sur la page.
- Remplissez correctement les quatre champs texte : "true", et l'envoi fonctionne.
- Tapez "marc" dans l'e-mail : "false". Tapez "marc@techcorp.fr" : "true".
- Problème : l'utilisateur ne sait pas **pourquoi** rien ne se passe. Les messages d'erreur arrivent au module 21.

---

## Module 21 - L'état des champs et les messages d'erreur (25 min)

### La notion

Chaque champ expose son **état** sous forme de signals :

| Signal                  | Signification                                     |
| ----------------------- | ------------------------------------------------- |
| `value()`               | La valeur actuelle                                |
| `valid()` / `invalid()` | Le champ respecte (ou non) toutes ses règles      |
| `errors()`              | La liste des erreurs, chacune avec son `message`  |
| `touched()`             | L'utilisateur a quitté le champ au moins une fois |
| `dirty()`               | L'utilisateur a modifié la valeur                 |

Bonne pratique : n'afficher une erreur **qu'après** que l'utilisateur a quitté le champ (`touched()`). Afficher "Le prénom est obligatoire" avant même qu'il ait commencé à taper serait agaçant. À l'envoi, `[formRoot]` marque **tous** les champs comme touchés : toutes les erreurs apparaissent d'un coup.

Pour l'accessibilité (WCAG 3.3.1), un champ en erreur doit :

- être signalé comme invalide : `aria-invalid="true"` ;
- être **relié** à son message : `aria-describedby="id-du-message"`. Le lecteur d'écran lit alors le message en arrivant sur le champ.

### Pas à pas

1. Supprimez le paragraphe "Formulaire valide" du module 20.
2. Au début de `add-employee.html`, sous le `<h1>`, créez un raccourci par champ avec `@let` :

```html
<p>Tous les champs sont obligatoires, sauf le télétravail.</p>

<!-- @let : un raccourci vers l'etat de chaque champ. -->
@let firstName = employeeForm.firstName(); @let lastName = employeeForm.lastName(); @let emailField
= employeeForm.email(); @let job = employeeForm.job();
```

3. Remplacez le bloc du prénom :

```html
<div class="field">
  <label for="first-name">Prénom</label>
  <input
    id="first-name"
    [formField]="employeeForm.firstName"
    [attr.aria-invalid]="firstName.touched() && firstName.invalid()"
    [attr.aria-describedby]="
        firstName.touched() && firstName.invalid() ? 'first-name-error' : null
      "
  />
  @if (firstName.touched() && firstName.invalid()) {
  <!-- errors()[0] : on affiche la premiere erreur du champ. -->
  <p class="field__error" id="first-name-error">{{ firstName.errors()[0].message }}</p>
  }
</div>
```

`null` dans une liaison `[attr.x]` : l'attribut est **retiré** de la balise.

4. Faites de même pour le nom (`lastName`, `last-name-error`) et l'e-mail (`emailField`, `email-error`).
5. Pour le poste, ajoutez en plus un compteur de caractères, toujours relié au champ :

```html
<div class="field">
  <label for="job">Poste</label>
  <input
    id="job"
    [formField]="employeeForm.job"
    [attr.aria-invalid]="job.touched() && job.invalid()"
    [attr.aria-describedby]="job.touched() && job.invalid() ? 'job-error' : 'job-hint'"
  />
  <small id="job-hint">{{ job.value().length }} / 40 caractères</small>
  @if (job.touched() && job.invalid()) {
  <p class="field__error" id="job-error">{{ job.errors()[0].message }}</p>
  }
</div>
```

6. Dans `add-employee.css`, ajoutez :

```css
.field__error {
  margin: 0;
  color: #b91c1c;
}

/* Le champ en erreur a une bordure rouge, en plus du message texte. */
[aria-invalid='true'] {
  border-color: #b91c1c;
}
```

### Vérifier

- Arrivez sur la page : aucune erreur affichée.
- Cliquez dans "Prénom" puis sortez du champ sans rien taper : "Le prénom est obligatoire" apparaît sous le champ, bordure rouge.
- Formulaire vide, cliquez sur "Ajouter" : les quatre messages apparaissent d'un coup, et vous restez sur la page.
- Tapez "D" dans "Nom" : "Le nom doit contenir au moins 2 lettres". Tapez "Dubois" : le message disparaît **pendant la frappe**.
- Cliquez sur "Effacer" : les messages disparaissent, car `reset()` a effacé l'état "touché".
- Inspectez un champ en erreur : `aria-invalid="true"` et `aria-describedby` pointent vers l'`id` du message.
- Un formulaire correctement rempli ajoute bien le collègue.

---

## Défis de la phase 5

### Intermédiaire

1. Ajoutez en haut du formulaire un **récapitulatif des erreurs**, affiché après une tentative d'envoi invalide, avec `role="alert"` pour qu'il soit annoncé immédiatement.
2. Désactivez le bouton "Ajouter" pendant l'envoi.

Indices :

- un signal `submitAttempted = signal(false)` et l'option `onInvalid: () => this.submitAttempted.set(true)` à côté de `action` ;
- `employeeForm().errorSummary()` renvoie toutes les erreurs du formulaire : parcourez-les avec `@for (error of ...; track $index)` ;
- `employeeForm().submitting()` vaut `true` pendant l'action.

### Avancé

1. **Règle personnalisée** : avec `validate(path.email, ({ value }) => ...)`, refusez les adresses qui ne se terminent pas par `@techcorp.fr`. La fonction renvoie `{ kind: 'domain', message: '...' }` si la règle n'est pas respectée, `undefined` sinon.
2. **Doublon** : refusez une adresse déjà utilisée par un collègue du `TeamStore`.
3. **Règle conditionnelle** : ajoutez un champ "Jours de télétravail par semaine" (nombre), obligatoire seulement si la case "En télétravail" est cochée. Indice : `required(path.x, { when: ({ valueOf }) => valueOf(path.remote) })`.
4. **Départ avec des modifications** : si l'utilisateur quitte la page alors que le formulaire est modifié (`employeeForm().dirty()`), demandez une confirmation avec un guard `canDeactivate`.

---

## Livrables attendus

- [ ] Le projet démarre avec `npm start`, sans erreur dans le terminal ni dans la console du navigateur (`F12`)
- [ ] L'accueil affiche un message de bienvenue, un statut du jour et un compteur de congés qui ne peut ni dépasser 25 ni devenir négatif
- [ ] La page équipe affiche les collègues avec `@for`, une recherche fonctionnelle et un bouton "Retirer"
- [ ] Les trois pages ont chacune leur adresse, leur titre d'onglet et leur `<h1>`
- [ ] Le formulaire d'ajout est en Signal Forms, validé, avec des messages d'erreur reliés aux champs
- [ ] La navigation au clavier fonctionne partout, et rien ne déborde en largeur mobile (375 px)
- [ ] `ng build` passe sans erreur

## Ce que vous retrouverez dans TechCorp RH

| Ce TP                                           | Le projet fil rouge                        |
| ----------------------------------------------- | ------------------------------------------ |
| `LeaveCounter`, `EmployeeCard` (modules 8 à 10) | Les cartes du tableau de bord (jour 2)     |
| `TeamStore` (module 14)                         | `EmployeeDirectory`, `LeaveStore` (jour 2) |
| Les trois pages (module 15)                     | Tableau de bord, congés, équipe (jour 3)   |
| Le formulaire d'ajout (modules 18 à 21)         | La demande de congé (jour 3)               |
| Les données en mémoire                          | L'API json-server puis NestJS (jour 4)     |

---

## Erreurs fréquentes

| Symptôme                                                         | Cause probable                                                       | Solution                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| `'app-xxx' is not a known element`                               | Composant absent du tableau `imports` du parent                      | L'importer en haut du fichier et l'ajouter dans `imports` |
| `Property 'xxx' does not exist on type 'App'`                    | Faute de frappe, ou propriété déplacée dans un autre composant       | Vérifier le nom et le fichier où elle est déclarée        |
| La page affiche `[Signal (status): ...]`, avertissement `NG8109` | Signal lu sans parenthèses : `status` au lieu de `status()`          | Ajouter `()`                                              |
| `Required input 'employee' ... must be specified`                | `[employee]="..."` oublié sur `<app-employee-card>`                  | Passer la valeur au composant                             |
| `Cannot find module '../models/employee'`                        | Chemin d'import incorrect après un déplacement                       | Vérifier le nombre de `../`                               |
| La page se recharge à l'envoi du formulaire                      | `[formRoot]` oublié sur `<form>`, ou `FormRoot` absent des `imports` | Ajouter les deux                                          |
| `Can't bind to 'formField'`                                      | `FormField` absent des `imports`                                     | L'ajouter                                                 |
| `Can't bind to 'ngModel'`                                        | `FormsModule` absent des `imports` (module 16)                       | L'ajouter                                                 |
| Les styles Material ne s'appliquent pas                          | `ng add @angular/material` lancé avec le serveur actif               | Arrêter puis relancer `npm start`                         |
| Port 4200 déjà utilisé                                           | Le projet fil rouge tourne déjà                                      | L'arrêter, ou `ng serve --port 4300`                      |
| Page blanche                                                     | Erreur à l'exécution                                                 | Console des DevTools (`F12`)                              |
