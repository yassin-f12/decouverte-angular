import { Component, computed, input } from '@angular/core';
import { Employee } from '../../models/employee';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  imports: [StatusBadge],
  selector: 'app-employee-card',
  styleUrl: './employee-card.css',
  templateUrl: './employee-card.html',
})
export class EmployeeCard {
  readonly employee = input.required<Employee>();
  readonly compact = input(false);

  readonly initiales = computed(
    () => this.employee().firstName.charAt(0) + this.employee().lastName.charAt(0),
  );
}
