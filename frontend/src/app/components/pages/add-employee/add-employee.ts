import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  maxLength,
  minLength,
  required,
  validate,
  min,
  max,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { TeamStore } from '../../../core/team-store';

// Le modèle du formulaire : une propriété par champ.
interface EmployeeDraft {
  firstName: string;
  lastName: string;
  email: string;
  job: string;
  department: string;
  remote: boolean;
  remoteDays: number | null;
}

// Les valeurs de départ, réutilisées pour vider le formulaire (module 19).
const EMPTY_DRAFT: EmployeeDraft = {
  firstName: '',
  lastName: '',
  email: '',
  job: '',
  department: 'Informatique',
  remote: false,
  remoteDays: 1,
};

@Component({
  imports: [FormField, FormRoot, MatButton],
  selector: 'app-add-employee',
  styleUrl: './add-employee.css',
  templateUrl: './add-employee.html',
})
export class AddEmployee {
  private readonly store = inject(TeamStore);
  private readonly router = inject(Router);

  protected readonly submitAttempted = signal(false);

  protected readonly departments = ['Informatique', 'Ressources humaines', 'Commercial'];

  // 1. Le modèle : un signal qui contient toutes les valeurs du formulaire.
  //    { ...EMPTY_DRAFT } : une copie, pour ne jamais modifier EMPTY_DRAFT.
  private readonly draft = signal<EmployeeDraft>({ ...EMPTY_DRAFT });

  // 2. Le formulaire : un champ par propriété du modèle.
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
      validate(path.email, ({ value }) =>
        value().endsWith('@techcorp.fr')
          ? undefined
          : {
              kind: 'domain',
              message: "L'adresse email doit obligatoirement terminé par : @techcorp.fr",
            },
      );
      validate(path.email, ({ value }) =>
        this.store.employees().some((employee) => employee.email === value())
          ? {
              kind: 'duplicate',
              message: "Cette email n'est pas accepté.",
            }
          : undefined,
      );
      required(path.job, { message: 'Le poste est obligatoire.' });
      maxLength(path.job, 40, { message: 'Le poste ne doit pas dépasser 40 caractères.' });
      required(path.remoteDays, {
        message: 'Le nombre de jours de télétravail est obligatoire.',
        when: ({ valueOf }) => valueOf(path.remote),
      });
      min(path.remoteDays, 1, {
        message: 'Le nombre de jours doit être au minimum de 1.',
      });
      max(path.remoteDays, 5, {
        message: 'Le nombre de jours doit être au maximum de 5.',
      });
    },
    {
      submission: {
        action: async () => this.save(),
        onInvalid: () => this.submitAttempted.set(true),
      },
    },
  );

  protected resetForm(): void {
    // reset() remet les valeurs ET efface l'état "touché" des champs.
    this.employeeForm().reset({ ...EMPTY_DRAFT });
  }

  public dirty(): boolean {
    return this.employeeForm().dirty();
  }

  private async save(): Promise<void> {
    this.store.add(this.draft());
    this.resetForm();
    await this.router.navigate(['/equipe']);
  }
}
