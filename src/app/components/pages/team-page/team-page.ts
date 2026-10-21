import { Component, computed, inject, signal } from '@angular/core';
import { TeamStore } from '../../../core/team-store';
import { SearchBox } from '../../search-box/search-box';
import { EmployeeCard } from '../../employee-card/employee-card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [SearchBox, EmployeeCard, MatButtonModule, MatIconModule],
  selector: 'app-team-page',
  styleUrl: './team-page.css',
  templateUrl: './team-page.html',
})
export class TeamPage {
  private readonly store = inject(TeamStore);
  protected readonly employees = this.store.employees;
  protected readonly search = signal('');

  protected readonly remoteCompt = computed(
    () => this.store.employees().filter((employee) => employee.remote).length,
  );

  protected readonly filteredEmployees = computed(() => {
    const text = this.search().trim().toLowerCase();

    return this.store
      .employees()
      .filter((employee) =>
        (employee.firstName + ' ' + employee.lastName).toLowerCase().includes(text),
      );
  });

  protected remove(id: number): void {
    this.store.remove(id);
  }
}
