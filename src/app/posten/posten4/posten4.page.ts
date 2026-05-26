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
  ergebnisText = '';
  hatSchnitzel = false;
  sensorAktiv = false;

  private intervalId: any;

  constructor(private router: Router, private gameService: GameService) {
    addIcons({ chevronBack });
  }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.timer++;
      const m = Math.floor(this.timer / 60);
      const s = this.timer % 60;
      this.timerDisplay = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

  // deviceorientation/absolute: beta is the front-back tilt (-180…180)
  // Phone upright portrait: beta ≈ 90  |  Phone upside-down: beta ≈ -90 or near ±180
  readonly onOrientation = (event: DeviceOrientationEvent): void => {
    this.ngZone.run(() => {
      const beta  = event.beta  ?? 0;
      const gamma = event.gamma ?? 0;

      // Progress towards "kopfüber": use absolute beta deviation from 0 (flat)
      // approaching ±180 means almost face-down; approaching -90 means top-down
      const absBeta = Math.abs(beta);
      this.fortschritt = Math.min(100, Math.round((absBeta / 180) * 100));

      // Consider completed when phone is clearly face-down OR rotated past 150°
      const kopfueber = absBeta > 150 || Math.abs(gamma) > 150;
      if (kopfueber && !this.postenAbgeschlossen) {
        this.abschliessen();
      }
    });
  };

  // DeviceMotion fallback: use gravity to detect upside-down
  readonly onMotion = (event: DeviceMotionEvent): void => {
    if (this.postenAbgeschlossen) return;
    const g = event.accelerationIncludingGravity;
    if (!g) return;
    const y = g.y ?? 0;
    const z = g.z ?? 0;

    this.ngZone.run(() => {
      // y ≈ -9.8 means phone normal portrait; y ≈ +9.8 means upside-down
      // Or z ≈ 9.8 means face-down
      const upsideDown = y > 7 || z > 7;
      if (!this.postenAbgeschlossen) {
        const prog = Math.min(100, Math.round(Math.max(y, z) / 9.8 * 100));
        if (prog > this.fortschritt) {
          this.fortschritt = prog;
        }
        if (upsideDown) {
          this.abschliessen();
        }
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
    this.gameService.recordResult(4, { schnitzel: 0, kartoffel: 0, skipped: true, timeSeconds: this.timer });
    this.router.navigate(['/posten']);
  }

  weiter(): void {
    this.router.navigate(['/posten5']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }
}
