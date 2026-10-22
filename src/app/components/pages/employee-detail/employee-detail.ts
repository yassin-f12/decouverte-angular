import { Component, computed, inject, input } from '@angular/core';
import { TeamStore } from '../../../core/team-store';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { StatusBadge } from '../../status-badge/status-badge';

@Component({
  imports: [RouterLink, MatButton, StatusBadge],
  selector: 'app-employee-detail',
  styleUrl: './employee-detail.css',
  templateUrl: './employee-detail.html',
})
export class EmployeeDetail {
  private readonly store = inject(TeamStore);

  readonly id = input.required<string>();

  readonly employee = computed(() => this.store.findById(Number(this.id())));
}
