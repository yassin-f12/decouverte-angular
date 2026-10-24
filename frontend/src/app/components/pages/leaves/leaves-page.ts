import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { AuthStore } from '../../../auth/auth-store';
import { LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS, Leave, NewLeave } from '../../../models/leave';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { LeaveApi } from '../../../api/leave-api';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../api/api-error';

const EMPTY_LEAVE: NewLeave = {
  type: 'paid',
  startDate: '',
  endDate: '',
  reason: '',
};

@Component({
  imports: [DatePipe, MatButton, FormField, FormRoot],
  selector: 'app-leaves-page',
  styleUrl: './leaves-page.css',
  templateUrl: './leaves-page.html',
})
export class LeavesPage {
  private readonly auth = inject(AuthStore);
  private readonly api = inject(LeaveApi);

  protected readonly typeLabels = LEAVE_TYPE_LABELS;
  protected readonly statusLabels = LEAVE_STATUS_LABELS;

  // employeeId : pour un employé, le serveur l'impose de toute façon (il lit le jeton).
  protected readonly leaves = httpResource<Leave[]>(() => ({
    url: '/api/leaves',
    params: {
      employeeId: this.auth.user()?.id ?? 0,
      _sort: 'startDate',
      _order: 'desc',
    },
  }));

  // Calculés à partir de la réponse du serveur.
  protected readonly pendingCount = computed(() =>
    this.leaves.hasValue() ? this.leaves.value().filter((l) => l.status === 'pending').length : 0,
  );
  protected readonly approvedPaidDays = computed(() =>
    this.leaves.hasValue()
      ? this.leaves
          .value()
          .filter((l) => l.type === 'paid' && l.status === 'approved')
          .reduce((total, l) => total + l.days, 0)
      : 0,
  );

  private readonly draft = signal<NewLeave>({ ...EMPTY_LEAVE });

  protected readonly leaveForm = form(
    this.draft,
    (path) => {
      required(path.startDate, { message: 'La date de début est obligatoire.' });
      required(path.endDate, { message: 'La date de fin est obligatoire.' });
      // Règle qui compare deux champs : valueOf lit la valeur d'un autre champ.
      validate(path.endDate, ({ value, valueOf }) => {
        const start = valueOf(path.startDate);
        if (start && value() && value() < start) {
          return { kind: 'order', message: 'La date de fin doit être après la date de début.' };
        }
        return undefined;
      });
      maxLength(path.reason, 100, { message: 'Le motif ne doit pas dépasser 100 caractères.' });
    },
    {
      submission: {
        action: async () => this.send(),
      },
    },
  );

  // Résultat de la dernière action, annoncé aux lecteurs d'écran.
  protected readonly message = signal('');

  protected async cancel(leave: Leave): Promise<void> {
    if (!confirm('Annuler cette demande de congé ?')) {
      return;
    }
    try {
      await firstValueFrom(this.api.cancel(leave.id));
      this.message.set('La demande a été annulée.');
      this.leaves.reload();
    } catch (error) {
      this.message.set(apiErrorMessage(error));
    }
  }

  private async send(): Promise<void> {
    this.message.set('');
    try {
      await firstValueFrom(this.api.create(this.draft()));
      this.leaveForm().reset({ ...EMPTY_LEAVE });
      this.message.set('Votre demande a été envoyée.');
      // On relit la liste : le serveur a calculé les jours et fixé le statut.
      this.leaves.reload();
    } catch (error) {
      this.message.set(apiErrorMessage(error));
    }
  }
}
