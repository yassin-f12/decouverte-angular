import { Component, computed, signal } from '@angular/core';
import { LeaveCounter } from '../../leave-counter/leave-counter';
import { MatButton } from '@angular/material/button';
import { httpResource } from '@angular/common/http';
import { Department } from '../../../models/department';

type Status = 'sur site' | 'en télétravail' | 'absent';

@Component({
  imports: [LeaveCounter, MatButton],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  // La requête part toute seule. Le résultat et l'état du chargement sont des signals.
  protected readonly departments = httpResource<Department[]>(() => '/api/departments');

  protected readonly userName = 'AYA';
  protected msg = '';
  protected texte = '';
  protected readonly status = signal<Status>('sur site');

  protected sayHey(): void {
    this.msg = 'Bienvenue dans TechCorp Équipe, ' + this.userName + '!';
  }

  protected recupererTexte(inputValeur: string): void {
    this.texte = inputValeur;
  }

  protected clearMessage(): void {
    this.msg = '';
  }

  protected changeStatus(newStatus: Status): void {
    this.status.set(newStatus);
  }

  protected readonly triDepart = computed(() => {
    if (this.departments.hasValue()) {
      const liste = this.departments.value();
      return [...liste].sort((a, b) => a.floor - b.floor);
    } else {
      return [];
    }
  });
}
