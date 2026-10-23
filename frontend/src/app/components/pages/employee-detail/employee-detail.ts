import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Employee } from '../../../models/employee';

@Component({
  imports: [RouterLink],
  selector: 'app-employee-detail',
  styleUrl: './employee-detail.css',
  templateUrl: './employee-detail.html',
})
export class EmployeeDetail {
  // Le paramètre :id de l'adresse /equipe/:id (withComponentInputBinding).
  readonly id = input.required<string>();

  // Relancée si l'id change (passage d'une fiche à une autre).
  protected readonly employee = httpResource<Employee>(() => `/api/employees/${this.id()}`);

  // 404 : l'identifiant n'existe pas. On le distingue d'une panne du serveur.
  protected readonly notFound = computed(() => {
    const error = this.employee.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });
}
