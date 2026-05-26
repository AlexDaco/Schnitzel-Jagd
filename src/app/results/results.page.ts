import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonFooter,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { TimerService } from '../services/timer.service';
import { PlayerService } from '../services/player.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { LeaderboardEntry } from '../models/leaderboard-entry';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonFooter, CommonModule,
  ],
})
export class ResultsPage implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly timerService = inject(TimerService);
  private readonly playerService = inject(PlayerService);
  private readonly leaderboardService = inject(LeaderboardService);
  private readonly router = inject(Router);

  playerName = '';
  totalSchnitzel = 0;
  totalKartoffel = 0;
  dauerSekunden = 0;
  dauerDisplay = '00:00:00';
  rank = 0;

  ngOnInit(): void {
    this.playerName = this.playerService.getPlayerName() ?? 'Unbekannt';
    this.totalSchnitzel = this.gameService.getTotalSchnitzel();
    this.totalKartoffel = this.gameService.getTotalKartoffel();
    this.dauerSekunden = this.timerService.finalElapsed ?? this.timerService.elapsed();
    this.dauerDisplay = this.timerService.format(this.dauerSekunden);

    const entry: LeaderboardEntry = {
      id: Date.now(),
      name: this.playerName,
      schnitzel: this.totalSchnitzel,
      kartoffeln: this.totalKartoffel,
      dauerSekunden: this.dauerSekunden,
      datum: this.gameService.gameStartDate,
    };

    this.leaderboardService.addEntry(entry);
    this.rank = this.calculateRank(entry);
  }

  private calculateRank(entry: LeaderboardEntry): number {
    let rank = 1;
    this.leaderboardService.getEntries().subscribe(entries => {
      for (const e of entries) {
        if (e.id === entry.id) continue;
        const better =
          e.schnitzel > entry.schnitzel ||
          (e.schnitzel === entry.schnitzel && e.kartoffeln < entry.kartoffeln) ||
          (e.schnitzel === entry.schnitzel && e.kartoffeln === entry.kartoffeln && e.dauerSekunden < entry.dauerSekunden);
        if (better) rank++;
      }
    });
    return rank;
  }

  get rankEmoji(): string {
    if (this.rank === 1) return '🥇';
    if (this.rank === 2) return '🥈';
    if (this.rank === 3) return '🥉';
    return `#${this.rank}`;
  }

  zuLeaderboard(): void {
    this.timerService.reset();
    this.gameService.startNewGame();
    this.playerService.clearPlayer();
    this.router.navigate(['/home']);
  }
}
