import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter, IonProgressBar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GameService } from '../../services/game.service';

const SCHNITZEL_THRESHOLD_S = 5;

@Component({
  selector: 'app-posten5',
  templateUrl: './posten5.page.html',
  styleUrls: ['./posten5.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, IonProgressBar, CommonModule,
  ],
})
export class Posten5Page implements OnInit, OnDestroy {
  timer = 0;
  timerDisplay = '00:00';
  postenAbgeschlossen = false;
  ergebnisText = '';
  hatSchnitzel = false;

  /** 1 = einstecken, 2 = ausstecken, 3 = fertig */
  currentStep: 1 | 2 | 3 = 1;
  wasSkipped = false;
  private wasCharging: boolean | null = null;
  private stepStartTime = 0;

  readonly steps = [
    { id: 1, label: 'Stecke dein Handy ans Ladekabel' },
    { id: 2, label: 'Entferne das Ladekabel wieder' },
  ];

  private intervalId: any;
  private batteryIntervalId: any;

  constructor(private router: Router, private gameService: GameService) {
    addIcons({ chevronBack });
  }

  async ngOnInit(): Promise<void> {
    const done = this.gameService.getResult(5);
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
    this.gameService.startPosten(5);
    this.timer = this.gameService.getPostenElapsed(5);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(5);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);

    try {
      const info = await Device.getBatteryInfo();
      this.wasCharging = info.isCharging === true;
      if (this.wasCharging) {
        this.currentStep = 2;
        this.stepStartTime = this.timer;
      }
    } catch {
      this.wasCharging = false;
    }

    this.batteryIntervalId = setInterval(() => this.checkBattery(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.batteryIntervalId);
  }

  private async checkBattery(): Promise<void> {
    if (this.postenAbgeschlossen) return;
    try {
      const info = await Device.getBatteryInfo();
      const isCharging = info.isCharging === true;

      if (this.currentStep === 1 && this.wasCharging === false && isCharging) {
        this.currentStep = 2;
        this.stepStartTime = this.timer;
      } else if (this.currentStep === 2 && this.wasCharging === true && !isCharging) {
        this.currentStep = 3;
        this.abschliessen();
      }

      this.wasCharging = isCharging;
    } catch {
      // ignore
    }
  }

  private abschliessen(): void {
    clearInterval(this.intervalId);
    clearInterval(this.batteryIntervalId);
    this.postenAbgeschlossen = true;
    const duration = this.timer - this.stepStartTime;
    const schnitzel = duration <= SCHNITZEL_THRESHOLD_S ? 1 : 0;
    const kartoffel = schnitzel === 1 ? 0 : 1;
    this.hatSchnitzel = schnitzel === 1;
    this.ergebnisText = schnitzel === 1
      ? `🥩 Schnitzel! Kabel in ${duration}s verbunden & getrennt!`
      : `🥔 Kartoffel! Du hast ${this.timer}s gebraucht.`;
    this.gameService.recordResult(5, { schnitzel, kartoffel, skipped: false, timeSeconds: this.timer });
    Haptics.impact({ style: ImpactStyle.Medium });
  }

  get progress(): number {
    if (this.currentStep === 1) return 0;
    if (this.currentStep === 2) return 0.5;
    return 1;
  }

  postenUeberspringen(): void {
    clearInterval(this.intervalId);
    clearInterval(this.batteryIntervalId);
    this.gameService.recordResult(5, { schnitzel: 0, kartoffel: 1, skipped: true, timeSeconds: this.timer });
    this.router.navigate(['/posten']);
  }

  async postenWiederholen(): Promise<void> {
    this.gameService.clearResult(5);
    this.postenAbgeschlossen = false;
    this.wasSkipped = false;
    this.ergebnisText = '';
    this.hatSchnitzel = false;
    this.currentStep = 1;
    this.stepStartTime = 0;
    this.wasCharging = null;
    this.timer = this.gameService.getPostenElapsed(5);
    this.timerDisplay = this.formatTime(this.timer);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(5);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);
    try {
      const info = await Device.getBatteryInfo();
      this.wasCharging = info.isCharging === true;
      if (this.wasCharging) { this.currentStep = 2; this.stepStartTime = this.timer; }
    } catch { this.wasCharging = false; }
    this.batteryIntervalId = setInterval(() => this.checkBattery(), 1000);
  }

  weiter(): void {
    this.router.navigate(['/posten6']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }

  private formatTime(s: number): string {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
}
