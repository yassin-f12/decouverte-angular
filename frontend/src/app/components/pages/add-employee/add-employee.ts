import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormField,
  FormRoot,
  TreeValidationResult,
  email,
  form,
  max,
  maxLength,
  min,
  minLength,
  required,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../api/api-error';
import { DepartmentApi } from '../../../api/department-api';
import { EmployeeApi, EmployeeDraft } from '../../../api/employee-api';

const EMPTY_DRAFT: EmployeeDraft = {
  firstName: '',
  lastName: '',
  email: '',
  job: '',
  department: 'Informatique',
  remote: false,
  remoteDays: null,
};

@Component({
  imports: [FormField, FormRoot, MatButton],
  selector: 'app-add-employee',
  styleUrl: './add-employee.css',
  templateUrl: './add-employee.html',
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
      required(path.firstName, { message: 'Le prénom est obligatoire.' });
      required(path.lastName, { message: 'Le nom est obligatoire.' });
      minLength(path.lastName, 2, {
        message: 'Le nom doit contenir au moins 2 lettres.',
      });
      required(path.email, { message: "L'e-mail est obligatoire." });
      email(path.email, {
        message: "L'e-mail n'est pas valide (exemple : prenom.nom@techcorp.fr).",
      });
      required(path.job, { message: 'Le poste est obligatoire.' });
      maxLength(path.job, 40, {
        message: 'Le poste ne doit pas dépasser 40 caractères.',
      });
      required(path.remoteDays, {
        message: 'Le nombre de jours est obligatoire.',
        when: ({ valueOf }) => valueOf(path.remote),
      });

      min(path.remoteDays, 1, {
        message: 'Choisissez au moins 1 jour.',
      });

      max(path.remoteDays, 5, {
        message: 'Le maximum est de 5 jours par semaine.',
      });
    },
    {
      submission: {
        action: async () => this.save(),
      },
    },
  );

  protected readonly submitAttempted = signal(false);

  // Erreur générale du serveur, affichée au-dessus des boutons.
  protected readonly serverError = signal('');
  protected readonly saved = signal(false);

  public dirty(): boolean {
    return this.employeeForm().dirty() && !this.saved();
  }

  protected resetForm(): void {
    this.saved.set(false);
    this.submitAttempted.set(false);
    this.employeeForm().reset({ ...EMPTY_DRAFT });
  }

  private async save(): Promise<TreeValidationResult> {
    this.serverError.set('');
    try {
      const created = await firstValueFrom(this.api.create(this.draft()));
      this.saved.set(true);
      // Le serveur a choisi l'id : on affiche la fiche du nouveau collègue.
      await this.router.navigate(['/equipe', created.id]);
      return undefined;
    } catch (error) {
      // 409 : e-mail déjà utilisé. L'erreur est rattachée au champ e-mail.
      if (error instanceof HttpErrorResponse && error.status === 409) {
        return {
          kind: 'server',
          message: apiErrorMessage(error),
          fieldTree: this.employeeForm.email().fieldTree,
        };
      }
      this.serverError.set(apiErrorMessage(error));
      return undefined;
    }
  }
}
