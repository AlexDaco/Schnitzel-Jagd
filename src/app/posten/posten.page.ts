import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonFooter, IonList, IonItem, IonLabel,
  AlertController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TimerService } from '../services/timer.service';
import { GameService } from '../services/game.service';
import { PlayerService } from '../services/player.service';

const POSTEN_DATA = [
  { id: 1, title: 'Posten 1', description: 'Begib dich zum Zielstandort', icon: '📍' },
  { id: 2, title: 'Posten 2', description: 'Lege 20 Meter zurück', icon: '🏃' },
  { id: 3, title: 'Posten 3', description: 'Scanne den QR-Code', icon: '📷' },
  { id: 4, title: 'Posten 4', description: 'Dreh dein Handy auf den Kopf', icon: '📱' },
  { id: 5, title: 'Posten 5', description: 'Schliesse dein Handy ans Strom an', icon: '⚡' },
  { id: 6, title: 'Posten 6', description: 'Verbinde & trenne dich vom WLAN', icon: '🛜' },
];

@Component({
  selector: 'app-posten',
  templateUrl: './posten.page.html',
  styleUrls: ['./posten.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonFooter, IonList, IonItem, IonLabel,
    CommonModule,
  ],
})
export class PostenPage implements OnInit {
  private readonly timerService = inject(TimerService);
  private readonly gameService = inject(GameService);
  private readonly playerService = inject(PlayerService);
  private readonly alertCtrl = inject(AlertController);
  private readonly router = inject(Router);

  postenList = POSTEN_DATA;

  readonly timerDisplay = computed(() =>
    this.timerService.format(this.timerService.elapsed()),
  );

  ngOnInit(): void {
    this.timerService.start();
  }

  ionViewWillEnter(): void {
    if (this.gameService.alleDone() && this.timerService.isRunning()) {
      this.timerService.stop();
    }
  }

  get allesDone(): boolean {
    return this.gameService.alleDone();
  }

  isPostenDone(id: number): boolean {
    return this.gameService.isPostenDone(id);
  }

  getPostenIcon(id: number): string {
    const result = this.gameService.getResult(id);
    if (!result) return '';
    if (result.skipped) return '⏭️';
    if (result.kartoffel > 0) return '🥔';
    return '✅';
  }

  openPosten(id: number): void {
    this.router.navigate(['/posten' + id]);
  }

  async schnitzeljagdBeenden(): Promise<void> {
    if (this.allesDone) {
      this.router.navigate(['/results']);
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Abbrechen?',
      message: 'Möchtest du die Schnitzeljagd wirklich abbrechen? Deine Ergebnisse gehen verloren.',
      buttons: [
        { text: 'Weiter spielen', role: 'cancel' },
        {
          text: 'Abbrechen',
          role: 'destructive',
          handler: () => {
            this.timerService.reset();
            this.gameService.startNewGame();
            this.playerService.clearPlayer();
            this.router.navigate(['/home']);
          },
        },
      ],
    });
    await alert.present();
  }
}
