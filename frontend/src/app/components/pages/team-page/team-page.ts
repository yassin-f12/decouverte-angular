import { httpResource } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { EmployeeCard } from '../../employee-card/employee-card';
import { Employee } from '../../../models/employee';
import { SearchBox } from '../../search-box/search-box';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
  imports: [EmployeeCard, SearchBox],
  selector: 'app-team-page',
  styleUrl: './team-page.css',
  templateUrl: './team-page.html',
})
export class TeamPage {
  // Ce que l'utilisateur tape, à chaque frappe.
  protected readonly search = signal('');
  // La même recherche, mais "calmée" : elle ne change que 300 ms après la dernière frappe.
  // signal -> Observable (toObservable) -> opérateurs RxJS -> signal (toSignal).
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(
      debounceTime(300), // attend 300 ms sans nouvelle frappe
      map((text) => text.trim()), // ignore les espaces autour
      distinctUntilChanged(), // ignore une valeur identique à la précédente
    ),
    { initialValue: '' },
  );

  // Relancée automatiquement quand search change.
  // ?q=... : recherche côté serveur, _sort=lastName : tri par nom.
  protected readonly employees = httpResource<Employee[]>(() => ({
    url: '/api/employees',
    params: { q: this.debouncedSearch(), _sort: 'lastName' },
  }));
}
