import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, map, of, retry } from 'rxjs';
import { Department } from '../models/department';

@Service()
export class DepartmentApi {
  private readonly http = inject(HttpClient);

  // Renvoie un Observable : AUCUNE requête ne part tant que personne ne s'abonne.
  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>('/api/departments');
  }

  // map transforme la réponse : [{ id, name, floor }, ...] devient ['Informatique', ...].
  getNames(): Observable<string[]> {
    return this.getAll().pipe(
      map((departments) => departments.map((d) => d.name)),
      retry(2),
      catchError(() => of(['Informatique'])),
    );
  }
}
