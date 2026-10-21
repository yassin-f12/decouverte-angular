import { Component, signal } from '@angular/core';
import { LeaveCounter } from '../../leave-counter/leave-counter';
import { MatButton } from '@angular/material/button';

type Status = 'sur site' | 'en télétravail' | 'absent';

@Component({
  imports: [LeaveCounter, MatButton],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
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
}
