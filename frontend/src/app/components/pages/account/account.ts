import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthUser } from '../../../models/auth';

@Component({
  imports: [],
  selector: 'app-account',
  styleUrl: './account.css',
  templateUrl: './account.html',
})
export class Account {
  // GET /api/me : sans jeton, le serveur répond 401.
  protected readonly me = httpResource<AuthUser>(() => '/api/me');
}
