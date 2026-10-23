// Les deux rôles reconnus par l'API.
export type Role = 'employee' | 'admin';

// L'utilisateur connecté, tel que renvoyé par l'API.
export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

// Réponse de POST /api/login.
export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}
