import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter, IonProgressBar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GameService } from '../../services/game.service';

const SCHNITZEL_THRESHOLD_S = 60;

@Component({
  selector: 'app-posten6',
  templateUrl: './posten6.page.html',
  styleUrls: ['./posten6.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, IonProgressBar, CommonModule,
  ],
})
export class Posten6Page implements OnInit, OnDestroy {
  timer = 0;
  timerDisplay = '00:00';
  postenAbgeschlossen = false;
  ergebnisText = '';
  hatSchnitzel = false;

  /** 1 = verbinden, 2 = trennen, 3 = fertig */
  currentStep: 1 | 2 | 3 = 1;
  wasSkipped = false;
  private wasConnected: boolean | null = null;
  private stepStartTime = 0;

  readonly steps = [
    { id: 1, label: 'Verbinde dich mit einem Netzwerk' },
    { id: 2, label: 'Trenne dich vom Netzwerk' },
  ];

  private intervalId: any;
  private networkIntervalId: any;

  constructor(private router: Router, private gameService: GameService) {
    addIcons({ chevronBack });
  }

  async ngOnInit(): Promise<void> {
    const done = this.gameService.getResult(6);
    if (done) {
      this.postenAbgeschlossen = true;
      this.hatSchnitzel = done.schnitzel === 1;
      this.timer = done.timeSeconds;
      this.timerDisplay = this.formatTime(done.timeSeconds);
      this.currentStep = 3;
      this.wasSkipped = done.skipped;
      this.ergebnisText = done.skipped
        ? '⏭️ Posten übersprungen.'
        : done.schnitzel === 1
          ? `🥩 Schnitzel! Deine Zeit: ${done.timeSeconds}s`
          : `🥔 Kartoffel. Deine Zeit: ${done.timeSeconds}s`;
      return;
    }
    this.gameService.startPosten(6);
    this.timer = this.gameService.getPostenElapsed(6);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(6);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);

    try {
      const status = await Network.getStatus();
      this.wasConnected = status.connected === true;
      if (this.wasConnected) {
        this.currentStep = 2;
        this.stepStartTime = this.timer;
      }
    } catch {
      this.wasConnected = false;
    }

    this.networkIntervalId = setInterval(() => this.checkNetwork(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.networkIntervalId);
  }

  private async checkNetwork(): Promise<void> {
    if (this.postenAbgeschlossen) return;
    try {
      const status = await Network.getStatus();
      const isConnected = status.connected === true;

      if (this.currentStep === 1 && this.wasConnected === false && isConnected) {
        this.currentStep = 2;
        this.stepStartTime = this.timer;
      } else if (this.currentStep === 2 && this.wasConnected === true && !isConnected) {
        this.currentStep = 3;
        this.abschliessen();
      }

      this.wasConnected = isConnected;
    } catch {
      // ignore
    }
  }

  private abschliessen(): void {
    clearInterval(this.intervalId);
    clearInterval(this.networkIntervalId);
    this.postenAbgeschlossen = true;
    const duration = this.timer - this.stepStartTime;
    const schnitzel = duration <= SCHNITZEL_THRESHOLD_S ? 1 : 0;
    const kartoffel = schnitzel === 1 ? 0 : 1;
    this.hatSchnitzel = schnitzel === 1;
    this.ergebnisText = schnitzel === 1
      ? `🥩 Schnitzel! WLAN in ${duration}s verbunden & getrennt!`
      : `🥔 Kartoffel! Du hast ${this.timer}s gebraucht.`;
    this.gameService.recordResult(6, { schnitzel, kartoffel, skipped: false, timeSeconds: this.timer });
    Haptics.impact({ style: ImpactStyle.Medium });
  }

  get progress(): number {
    if (this.currentStep === 1) return 0;
    if (this.currentStep === 2) return 0.5;
    return 1;
  }

  postenUeberspringen(): void {
    clearInterval(this.intervalId);
    clearInterval(this.networkIntervalId);
    this.gameService.recordResult(6, { schnitzel: 0, kartoffel: 1, skipped: true, timeSeconds: this.timer });
    this.router.navigate(['/posten']);
  }

  async postenWiederholen(): Promise<void> {
    this.gameService.clearResult(6);
    this.postenAbgeschlossen = false;
    this.wasSkipped = false;
    this.ergebnisText = '';
    this.hatSchnitzel = false;
    this.currentStep = 1;
    this.stepStartTime = 0;
    this.wasConnected = null;
    this.timer = this.gameService.getPostenElapsed(6);
    this.timerDisplay = this.formatTime(this.timer);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(6);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);
    try {
      const status = await Network.getStatus();
      this.wasConnected = status.connected === true;
      if (this.wasConnected) { this.currentStep = 2; this.stepStartTime = this.timer; }
    } catch { this.wasConnected = false; }
    this.networkIntervalId = setInterval(() => this.checkNetwork(), 1000);
  }

  weiter(): void {
    this.router.navigate(['/posten']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }

  private formatTime(s: number): string {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
}
