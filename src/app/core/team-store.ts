import { Service, signal } from '@angular/core';
import { Employee } from '../models/employee';

// @Service() : Angular crée une seule instance, partagée par toute l'application.
@Service()
export class TeamStore {
  // private : seul le service peut modifier la liste.
  private readonly employeesSignal = signal<Employee[]>([
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
      remote: true,
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
  ]);

  // Version en lecture seule pour les composants.
  readonly employees = this.employeesSignal.asReadonly();

  // Prochain identifiant libre : 3 collègues au départ. attention c que dans le cas de c  tp, dans un projet avec bdd, le id viens de labas
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
