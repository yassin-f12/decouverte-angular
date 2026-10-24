import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Leave, NewLeave } from '../models/leave';

const API_URL = '/api/leaves';

@Service()
export class LeaveApi {
  private readonly http = inject(HttpClient);

  create(leave: NewLeave): Observable<Leave> {
    return this.http.post<Leave>(API_URL, leave);
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
