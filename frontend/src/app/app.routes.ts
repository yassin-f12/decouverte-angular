import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { TeamPage } from './components/pages/team-page/team-page';
import { EmployeeDetail } from './components/pages/employee-detail/employee-detail';
import { unsavedChangesGuard } from './core/unsaved-changes-guard';
import { Labo } from './components/pages/labo/labo';

export const routes: Routes = [
  // title : le titre de l'onglet, différent pour chaque page.
  { path: '', title: 'Accueil | TechCorp Équipe', component: Home },
  {
    path: 'equipe/:id',
    component: EmployeeDetail,
  },
  { path: 'equipe', title: 'Équipe | TechCorp Équipe', component: TeamPage },
  {
    path: 'ajouter',
    title: 'Ajouter un collègue | TechCorp Équipe',
    loadComponent: () =>
      import('./components/pages/add-employee/add-employee').then((mod) => mod.AddEmployee),
    canDeactivate: [unsavedChangesGuard],
  },
  { path: 'labo', title: 'Laboratoire | TechCorp Équipe', component: Labo },
  // Toute autre adresse renvoie vers l'accueil. Toujours en dernier.
  { path: '**', redirectTo: '' },
];
