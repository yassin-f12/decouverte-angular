import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthStore } from './auth-store';
import { LoginResponse } from '../models/auth';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('AuthStore', () => {
  let store: AuthStore;
  let httpMock: HttpTestingController;

  const session: LoginResponse = {
    token: 'test-token',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    user: {
      id: 1,
      email: 'admin@equipe.fr',
      role: 'admin',
    },
  } as LoginResponse;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthStore, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('démarre sans utilisateur connecté', () => {
    expect(store.user()).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.isLoggedIn()).toBe(false);
    expect(store.isAdmin()).toBe(false);
  });

  it('connecte un utilisateur et conserve sa session', async () => {
    const loginPromise = store.login('admin@equipe.fr', 'secret');

    const request = httpMock.expectOne('/api/login');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'admin@equipe.fr',
      password: 'secret',
    });

    request.flush(session);
    await loginPromise;

    expect(store.user()).toEqual(session.user);
    expect(store.token()).toBe('test-token');
    expect(store.isLoggedIn()).toBe(true);
    expect(store.isAdmin()).toBe(true);
    expect(JSON.parse(sessionStorage.getItem('equipe.session')!)).toEqual(session);
  });

  it('efface la session lors de la déconnexion', async () => {
    const loginPromise = store.login('admin@equipe.fr', 'secret');
    httpMock.expectOne('/api/login').flush(session);
    await loginPromise;

    store.logout();

    const request = httpMock.expectOne('/api/logout');
    expect(request.request.method).toBe('POST');
    request.flush({});

    expect(store.user()).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('equipe.session')).toBeNull();
  });

  it('efface la session avec clear()', async () => {
    const loginPromise = store.login('admin@equipe.fr', 'secret');
    httpMock.expectOne('/api/login').flush(session);
    await loginPromise;

    store.clear();

    expect(store.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('equipe.session')).toBeNull();
  });

  it('propage une erreur lorsque la connexion échoue', async () => {
    const loginPromise = store.login('admin@equipe.fr', 'faux');

    httpMock
      .expectOne('/api/login')
      .flush({ message: 'Identifiants invalides' }, { status: 401, statusText: 'Unauthorized' });

    await expect(loginPromise).rejects.toMatchObject({
      status: 401,
    });
  });
});
