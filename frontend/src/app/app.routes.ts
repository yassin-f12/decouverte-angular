import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { TeamPage } from './components/pages/team-page/team-page';
import { EmployeeDetail } from './components/pages/employee-detail/employee-detail';
import { unsavedChangesGuard } from './core/unsaved-changes-guard';
import { Labo } from './components/pages/labo/labo';
import { Login } from './components/pages/login/login';
import { Account } from './components/pages/account/account';
import { adminGuard, authGuard, guestGuard } from './auth/auth.guards';
import { AccesRefuse } from './components/pages/acces-refuse/acces-refuse';

export const routes: Routes = [
  // Pages publiques.
  { path: '', title: 'Accueil | TechCorp Équipe', component: Home },
  { path: 'labo', title: 'Laboratoire | TechCorp Équipe', component: Labo },
  {
    path: 'connexion',
    title: 'Connexion | TechCorp Équipe',
    component: Login,
    canActivate: [guestGuard],
  },
  { path: 'acces-refuse', title: 'Accès refusé | Comprendre pourquoi ?', component: AccesRefuse },

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
    path: 'equipe/:id',
    title: 'Fiche collègue | TechCorp Équipe',
    component: EmployeeDetail,
    canActivate: [authGuard],
  },
  {
    path: 'ajouter',
    title: 'Ajouter un collègue | TechCorp Équipe',
    loadComponent: () =>
      import('./components/pages/add-employee/add-employee').then((mod) => mod.AddEmployee),
    canActivate: [authGuard, adminGuard],
    canDeactivate: [unsavedChangesGuard],
  },

  // Toute autre adresse renvoie vers l'accueil. Toujours en dernier.
  { path: '**', redirectTo: '' },
];
