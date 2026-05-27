import { Component, NgZone, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GameService } from '../../services/game.service';

const SCHNITZEL_THRESHOLD_S = 10;

@Component({
  selector: 'app-posten4',
  templateUrl: './posten4.page.html',
  styleUrls: ['./posten4.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, CommonModule,
  ],
})
export class Posten4Page implements OnInit, OnDestroy {
  private readonly ngZone = inject(NgZone);

  timer = 0;
  timerDisplay = '00:00';
  fortschritt = 0;
  postenAbgeschlossen = false;
  wasSkipped = false;
  ergebnisText = '';
  hatSchnitzel = false;
  sensorAktiv = false;

  private intervalId: any;
  private calibratedBeta: number | null = null;

  constructor(private router: Router, private gameService: GameService) {
    addIcons({ chevronBack });
  }

  ngOnInit(): void {
    const done = this.gameService.getResult(4);
    if (done) {
      this.postenAbgeschlossen = true;
      this.hatSchnitzel = done.schnitzel === 1;
      this.timer = done.timeSeconds;
      this.timerDisplay = this.formatTime(done.timeSeconds);
      this.fortschritt = 100;
      this.wasSkipped = done.skipped;
      this.ergebnisText = done.skipped
        ? '⏭️ Posten übersprungen.'
        : done.schnitzel === 1
          ? `🥩 Schnitzel! Deine Zeit: ${done.timeSeconds}s`
          : `🥔 Kartoffel. Deine Zeit: ${done.timeSeconds}s`;
      return;
    }
    this.gameService.startPosten(4);
    this.timer = this.gameService.getPostenElapsed(4);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(4);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);

    // deviceorientationabsolute is more reliable on Android; fall back to deviceorientation
    const win = window as any;
    const useAbsolute = 'ondeviceorientationabsolute' in window;
    win.addEventListener(
      useAbsolute ? 'deviceorientationabsolute' : 'deviceorientation',
      this.onOrientation,
    );
    // DeviceMotion as additional fallback
    window.addEventListener('devicemotion', this.onMotion);
    this.sensorAktiv = true;
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    (window as any).removeEventListener('deviceorientationabsolute', this.onOrientation);
    window.removeEventListener('deviceorientation', this.onOrientation);
    window.removeEventListener('devicemotion', this.onMotion);
  }

  // Calibrates on first event so 0% = exact position at page entry regardless of hold angle.
  readonly onOrientation = (event: DeviceOrientationEvent): void => {
    this.ngZone.run(() => {
      const beta = event.beta ?? 0;

      if (this.calibratedBeta === null) {
        this.calibratedBeta = beta;
      }

      const deviation = Math.abs(beta - this.calibratedBeta);
      this.fortschritt = Math.min(100, Math.round(deviation / 180 * 100));

      if (deviation > 150 && !this.postenAbgeschlossen) {
        this.abschliessen();
      }
    });
  };

  // DeviceMotion fallback: y ≈ -9.8 upright portrait → y ≈ +9.8 upside-down
  readonly onMotion = (event: DeviceMotionEvent): void => {
    if (this.postenAbgeschlossen) return;
    const g = event.accelerationIncludingGravity;
    if (!g) return;
    const y = g.y ?? 0;

    this.ngZone.run(() => {
      // Map -9.8 → 0%, +9.8 → 100%
      const prog = Math.min(100, Math.max(0, Math.round((y + 9.8) / 19.6 * 100)));
      if (prog > this.fortschritt) {
        this.fortschritt = prog;
      }
      if (y > 7 && !this.postenAbgeschlossen) {
        this.abschliessen();
      }
    });
  };

  private abschliessen(): void {
    clearInterval(this.intervalId);
    (window as any).removeEventListener('deviceorientationabsolute', this.onOrientation);
    window.removeEventListener('deviceorientation', this.onOrientation);
    window.removeEventListener('devicemotion', this.onMotion);
    this.postenAbgeschlossen = true;
    this.fortschritt = 100;
    const schnitzel = this.timer <= SCHNITZEL_THRESHOLD_S ? 1 : 0;
    const kartoffel = schnitzel === 1 ? 0 : 1;
    this.hatSchnitzel = schnitzel === 1;
    this.ergebnisText = schnitzel === 1
      ? `🥩 Schnitzel! In ${this.timer}s umgedreht!`
      : `🥔 Kartoffel! Du hast ${this.timer}s gebraucht.`;
    this.gameService.recordResult(4, { schnitzel, kartoffel, skipped: false, timeSeconds: this.timer });
    Haptics.impact({ style: ImpactStyle.Medium });
  }

  postenUeberspringen(): void {
    clearInterval(this.intervalId);
    (window as any).removeEventListener('deviceorientationabsolute', this.onOrientation);
    window.removeEventListener('deviceorientation', this.onOrientation);
    window.removeEventListener('devicemotion', this.onMotion);
    this.gameService.recordResult(4, { schnitzel: 0, kartoffel: 1, skipped: true, timeSeconds: this.timer });
    this.router.navigate(['/posten']);
  }

  postenWiederholen(): void {
    this.gameService.clearResult(4);
    this.postenAbgeschlossen = false;
    this.wasSkipped = false;
    this.ergebnisText = '';
    this.hatSchnitzel = false;
    this.fortschritt = 0;
    this.calibratedBeta = null;
    this.timer = this.gameService.getPostenElapsed(4);
    this.timerDisplay = this.formatTime(this.timer);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(4);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);
    const win = window as any;
    const useAbsolute = 'ondeviceorientationabsolute' in window;
    win.addEventListener(useAbsolute ? 'deviceorientationabsolute' : 'deviceorientation', this.onOrientation);
    window.addEventListener('devicemotion', this.onMotion);
    this.sensorAktiv = true;
  }

  weiter(): void {
    this.router.navigate(['/posten5']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }

  private formatTime(s: number): string {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
}
