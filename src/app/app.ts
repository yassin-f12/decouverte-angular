import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeaveCounter } from './components/leave-counter/leave-counter';
import { EmployeeCard } from './components/employee-card/employee-card';

type Status = 'sur site' | 'en télétravail' | 'absent';

@Component({
  imports: [RouterOutlet, LeaveCounter, EmployeeCard],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly appName = 'TechCorp Équipe';
  protected readonly userName = 'Alves';
  protected msg = '';

  protected readonly status = signal<Status>('sur site');

  protected sayHey(): void {
    this.msg = 'Bienvenue dans TechCorp Équipe, ' + this.userName + '!';
  }

  protected clearMessage(): void {
    this.msg = '';
  }

  protected changeStatus(newStatus: Status): void {
    this.status.set(newStatus);
  }
}
