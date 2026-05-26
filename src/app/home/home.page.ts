import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel,
  IonFooter, IonButton,
  AlertController, ToastController,
} from '@ionic/angular/standalone';

import { LeaderboardEntry } from '../models/leaderboard-entry';
import { LeaderboardService } from '../services/leaderboard.service';
import { PlayerService } from '../services/player.service';
import { GameService } from '../services/game.service';
import { TimerService } from '../services/timer.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel,
    IonFooter, IonButton,
  ],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  private readonly leaderboardService = inject(LeaderboardService);
  private readonly playerService      = inject(PlayerService);
  private readonly gameService        = inject(GameService);
  private readonly timerService       = inject(TimerService);
  private readonly alertCtrl          = inject(AlertController);
  private readonly toastCtrl          = inject(ToastController);
  private readonly router             = inject(Router);

  entries: LeaderboardEntry[] = [];

  ngOnInit(): void {
    this.loadEntries();
  }

  ionViewWillEnter(): void {
    this.loadEntries();
  }
  formatDauer(sekunden: number): string {
    const h = Math.floor(sekunden / 3600);
    const m = Math.floor((sekunden % 3600) / 60);
    const s = sekunden % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `00:${pad(m)}:${pad(s)}`;
  }


  async startSchnitzeljagd(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Spielername',
      message: 'Bitte gib deinen Namen ein, um zu starten:',
      inputs: [
        { name: 'spielerName', type: 'text', placeholder: 'Dein Name' },
      ],
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Starten',
          handler: async data => {
            const name = data.spielerName?.trim();

            if (!name) {
              await this.showToast('Bitte gib einen Namen ein.', 'warning');
              return false;
            }

            if (this.leaderboardService.playerExists(name)) {
              await this.showToast(
                `Der Name "${name}" ist bereits vergeben.`,
                'danger',
              );
              return false;
            }

            this.gameService.startNewGame();
            this.timerService.reset();
            this.playerService.setPlayerName(name);
            this.router.navigate(['/authorization']);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private loadEntries(): void {
    this.leaderboardService.getEntries()
      .subscribe(entries => this.entries = entries);
  }

  /** Helper */
  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
