import { Component, computed, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
  imports: [MatButton, MatCard, MatCardContent, MatCardHeader, MatCardTitle],
  selector: 'app-leave-counter',
  styleUrl: './leave-counter.css',
  templateUrl: './leave-counter.html',
})
export class LeaveCounter {
  protected readonly totalDays = 25;
  protected readonly daysTaken = signal(0);
  protected readonly history = signal<string[]>([]);

  // Recalculés automatiquement quand daysTaken change.
  protected readonly remainingDays = computed(() => this.totalDays - this.daysTaken());
  protected readonly isEmpty = computed(() => this.remainingDays() === 0);

  protected addDay(): void {
    this.daysTaken.update((days) => Math.min(days + 1, this.totalDays));
    this.addHistory('+1 jour');
  }

  protected readonly usedPercent = computed(() =>
    Math.round((this.daysTaken() / this.totalDays) * 100),
  );

  protected removeDay(): void {
    this.daysTaken.update((days) => Math.max(days - 1, 0));
    this.addHistory('+- jour');
  }

  protected reset(): void {
    this.daysTaken.set(0);
    this.addHistory('Remise à zéro');
  }

  protected week(): void {
    this.daysTaken.update((days) => Math.min(days + 5, this.totalDays));
    this.addHistory('+5 jours');
  }

  protected addHistory(text: string) {
    this.history.update((days) => [...days, text]);
  }
}
