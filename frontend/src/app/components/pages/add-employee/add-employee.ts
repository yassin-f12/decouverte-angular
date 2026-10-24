import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal, OnInit } from '@angular/core';
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
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../api/api-error';
import { DepartmentApi } from '../../../api/department-api';
import { EmployeeApi, EmployeeDraft } from '../../../api/employee-api';
import { Employee } from '../../../models/employee';

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
  imports: [FormField, FormRoot, MatButton, RouterLink],
  selector: 'app-add-employee',
  styleUrl: './add-employee.css',
  templateUrl: './add-employee.html',
})
export class AddEmployee implements OnInit {
  private readonly api = inject(EmployeeApi);
  private readonly departmentApi = inject(DepartmentApi);
  private readonly router = inject(Router);
  // Présent seulement en modification : le :id de l'adresse.
  readonly id = input<string>();

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
          fieldTree: this.employeeForm.email().fieldTree,
        };
      }
      this.serverError.set(apiErrorMessage(error));
      return undefined;
    }
  }
}
// La fiche reçue contient un id : le formulaire, lui, n'en a pas.
function toDraft(employee: Employee): EmployeeDraft {
  const draft = { ...employee };
  delete (draft as Partial<Employee>).id;
  return draft;
}
