import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee';

// Un collègue sans id : c'est le serveur qui choisit l'identifiant.
export type EmployeeDraft = Omit<Employee, 'id'>;

const API_URL = '/api/employees';

// Les actions sur les collègues. Les listes, elles, sont lues avec httpResource.
@Service()
export class EmployeeApi {
  private readonly http = inject(HttpClient);

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${API_URL}/${id}`);
  }

  create(draft: EmployeeDraft): Observable<Employee> {
    return this.http.post<Employee>(API_URL, draft);
  }

  update(id: number, draft: EmployeeDraft): Observable<Employee> {
    return this.http.put<Employee>(`${API_URL}/${id}`, draft);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
