import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Employee } from '../../../models/employee';
import { MatButton } from '@angular/material/button';
import { AuthStore } from '../../../auth/auth-store';
import { EmployeeApi } from '../../../api/employee-api';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../api/api-error';

@Component({
  imports: [RouterLink, MatButton],
  selector: 'app-employee-detail',
  styleUrl: './employee-detail.css',
  templateUrl: './employee-detail.html',
})
export class EmployeeDetail {
  // Le paramètre :id de l'adresse /equipe/:id (withComponentInputBinding).
  readonly id = input.required<string>();
  protected readonly auth = inject(AuthStore);

  private readonly api = inject(EmployeeApi);
  private readonly router = inject(Router);

  protected readonly deleting = signal(false);
  protected readonly actionError = signal('');

  // Relancée si l'id change (passage d'une fiche à une autre).
  protected readonly employee = httpResource<Employee>(() => `/api/employees/${this.id()}`);

  // 404 : l'identifiant n'existe pas. On le distingue d'une panne du serveur.
  protected readonly notFound = computed(() => {
    const error = this.employee.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

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
}
