import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GameService } from '../../services/game.service';

const TARGET_DISTANCE_M = 20;
const SCHNITZEL_THRESHOLD_S = 30;

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Component({
  selector: 'app-posten2',
  templateUrl: './posten2.page.html',
  styleUrls: ['./posten2.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, CommonModule,
  ],
})
export class Posten2Page implements OnInit, OnDestroy {
  timer = 0;
  timerDisplay = '00:00';
  zurueckgelegtMeters: number = 0;
  restMeters: number = TARGET_DISTANCE_M;
  postenAbgeschlossen = false;
  wasSkipped = false;
  ergebnisText = '';
  hatSchnitzel = false;

  private intervalId: any;
  private watchId: string | null = null;
  startLat: number | null = null;
  private startLng: number | null = null;

  constructor(private router: Router, private gameService: GameService) {
    addIcons({ chevronBack });
  }

  ngOnInit(): void {
    const done = this.gameService.getResult(2);
    if (done) {
      this.postenAbgeschlossen = true;
      this.hatSchnitzel = done.schnitzel === 1;
      this.timer = done.timeSeconds;
      this.timerDisplay = this.formatTime(done.timeSeconds);
      this.restMeters = 0;
      this.wasSkipped = done.skipped;
      this.ergebnisText = done.skipped
        ? '⏭️ Posten übersprungen.'
        : done.schnitzel === 1
          ? `🥩 Schnitzel! Deine Zeit: ${done.timeSeconds}s`
          : `🥔 Kartoffel. Deine Zeit: ${done.timeSeconds}s`;
      return;
    }
    this.gameService.startPosten(2);
    this.timer = this.gameService.getPostenElapsed(2);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(2);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);

    this.startGps();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    if (this.watchId !== null) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  private async startGps(): Promise<void> {
    try {
      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (position, err) => {
          if (err || !position) return;
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (this.startLat === null) {
            this.startLat = lat;
            this.startLng = lng;
            return;
          }

          const moved = haversineMeters(this.startLat!, this.startLng!, lat, lng);
          this.zurueckgelegtMeters = Math.round(moved);
          this.restMeters = Math.max(0, TARGET_DISTANCE_M - this.zurueckgelegtMeters);

          if (moved >= TARGET_DISTANCE_M && !this.postenAbgeschlossen) {
            this.abschliessen();
          }
        },
      );
    } catch {
      // GPS unavailable
    }
  }

  private abschliessen(): void {
    clearInterval(this.intervalId);
    if (this.watchId !== null) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.postenAbgeschlossen = true;
    this.restMeters = 0;
    const schnitzel = this.timer <= SCHNITZEL_THRESHOLD_S ? 1 : 0;
    const kartoffel = schnitzel === 1 ? 0 : 1;
    this.hatSchnitzel = schnitzel === 1;
    this.ergebnisText = schnitzel === 1
      ? `🥩 Schnitzel! 20m in ${this.timer}s!`
      : `🥔 Kartoffel! Du hast ${this.timer}s gebraucht.`;
    this.gameService.recordResult(2, { schnitzel, kartoffel, skipped: false, timeSeconds: this.timer });
    Haptics.impact({ style: ImpactStyle.Medium });
  }

  postenUeberspringen(): void {
    clearInterval(this.intervalId);
    if (this.watchId !== null) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.gameService.recordResult(2, { schnitzel: 0, kartoffel: 1, skipped: true, timeSeconds: this.timer });
    this.router.navigate(['/posten']);
  }

  postenWiederholen(): void {
    this.gameService.clearResult(2);
    this.postenAbgeschlossen = false;
    this.wasSkipped = false;
    this.ergebnisText = '';
    this.hatSchnitzel = false;
    this.startLat = null;
    this.startLng = null;
    this.zurueckgelegtMeters = 0;
    this.restMeters = TARGET_DISTANCE_M;
    this.timer = this.gameService.getPostenElapsed(2);
    this.timerDisplay = this.formatTime(this.timer);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(2);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);
    this.startGps();
  }

  weiter(): void {
    this.router.navigate(['/posten3']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }

  private formatTime(s: number): string {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
}
