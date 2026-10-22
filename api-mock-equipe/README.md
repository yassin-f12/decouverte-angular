# Fausse API TechCorp Équipe (TP 2 bonus)

API REST simulée pour le TP 2 bonus (`tp/tp-jour5-bonus-api-securite.md`). Elle repose sur json-server 0.17.4, qui fournit le CRUD complet, entouré d'un petit serveur Express (`server.cjs`) qui ajoute ce qu'une vraie API ferait : connexion par jeton, droits selon le rôle, validation des données.


```bash
npm install
npm start        # http://localhost:3000/api
```


- `npm start` recopie `seed.json` dans `db.json` : chaque démarrage repart des données initiales. Les modifications sont écrites dans `db.json` (ignoré par Git). `npm run start:keep` redémarre **sans** réinitialiser les données.
- Chaque réponse est ralentie de 500 ms pour rendre visibles les états de chargement du front.
- Les jetons sont gardés en mémoire : **redémarrer le serveur déconnecte tout le monde**. C'est utile pour tester la gestion du 401 dans le front (module 15 du TP).

Variables d'environnement facultatives : `PORT` (3000), `DELAY` en millisecondes (500), `TOKEN_TTL_MINUTES` (30). Exemple pour tester l'expiration : `TOKEN_TTL_MINUTES=1 npm start` (Git Bash).

## Comptes de démonstration

Mot de passe commun : `TechCorp2026!`

| E-mail | Rôle | Collègue |
|---|---|---|
| `claire.martin@techcorp.fr` | `employee` | id 1 |
| `julien.bernard@techcorp.fr` | `employee` | id 2 |
| `sarah.lefevre@techcorp.fr` | `admin` (administratrice RH) | id 3 |

Les comptes sont dans `accounts.json`, qui n'est **pas** exposé par l'API.

## Données

| Ressource | Contenu |
|---|---|
| `departments` | 5 services (nom, étage) |
| `employees` | 32 collègues répartis dans les 5 services |
| `leaves` | 52 demandes de congé (congés payés, RTT, sans solde), en attente, acceptées ou refusées, d'août 2026 à février 2027 |

Les demandes de Claire, Julien et Sarah sont fixes, pour que les écrans du TP soient prévisibles. Claire a 4 demandes, dont 2 en attente.

## Routes et règles

| Route | Accès | Règles |
|---|---|---|
| `POST /api/login` | Public | Corps `{ email, password }`. Réponse `{ token, expiresAt, user }`. 400 si un champ manque, 401 si les identifiants sont faux |
| `POST /api/logout` | Avec jeton | Le serveur oublie le jeton. 204 |
| `GET /api/me` | Avec jeton | L'utilisateur du jeton |
| `GET /api/departments` | **Public** | Lecture seule (405 pour toute écriture) |
| `GET /api/employees`, `GET /api/employees/:id` | Avec jeton | Recherche `?q=`, tri `?_sort=lastName`, pagination `?_page=2&_limit=8` (en-tête `X-Total-Count`), filtre `?department=Finance` |
| `POST`, `PUT`, `PATCH`, `DELETE /api/employees` | `admin` | 403 sinon. Validation : 400 avec `message: [...]`, 409 si l'e-mail est déjà utilisé. L'`id` envoyé est ignoré. Supprimer un collègue supprime ses congés. Un administrateur ne peut pas supprimer sa propre fiche (409) |
| `GET /api/leaves` | Avec jeton | Un `employee` ne reçoit que **ses** demandes, quel que soit le paramètre `employeeId` envoyé. `?_expand=employee` ajoute le collègue |
| `GET /api/leaves/:id` | Avec jeton | 403 si la demande appartient à quelqu'un d'autre (sauf `admin`) |
| `POST /api/leaves` | Avec jeton | Corps `{ type, startDate, endDate, reason }`. Le serveur fixe `employeeId` (jeton), `status: "pending"`, `days` (jours ouvrés) et `createdAt` |
| `PATCH /api/leaves/:id` | `admin` | Seul `status` est modifiable : `pending`, `approved` ou `rejected` |
| `DELETE /api/leaves/:id` | Propriétaire ou `admin` | Un `employee` ne peut annuler qu'une demande **en attente** (409 sinon) |

Toutes les routes protégées attendent l'en-tête `Authorization: Bearer <jeton>` et répondent 401 `{ "message": "Authentification requise." }` sans lui.

## Limites volontaires

C'est un faux serveur pédagogique : les mots de passe sont en clair dans `accounts.json` et le jeton est une simple chaîne aléatoire. Une vraie API stocke des mots de passe hashés (bcrypt) et signe ses jetons (JWT) : c'est ce que fait l'API NestJS du jour 5.

Version utilisée : json-server 0.17.4. La version 1.0 (bêta) transforme les identifiants numériques en chaînes de caractères.
