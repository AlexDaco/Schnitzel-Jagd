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

const TARGET_LAT = 47.02753320993637;
const TARGET_LNG = 8.30092852135301;
const SCHNITZEL_THRESHOLD_S = 120;
const REACH_RADIUS_M = 5;

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
  selector: 'app-posten1',
  templateUrl: './posten1.page.html',
  styleUrls: ['./posten1.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, CommonModule,
  ],
})
export class Posten1Page implements OnInit, OnDestroy {
  timer = 0;
  timerDisplay = '00:00';
  distanzMeters: number | null = null;
  postenAbgeschlossen = false;
  wasSkipped = false;
  ergebnisText = '';
  hatSchnitzel = false;

  private intervalId: any;
  private watchId: string | null = null;

  constructor(private router: Router, private gameService: GameService) {
    addIcons({ chevronBack });
  }

  ngOnInit(): void {
    const done = this.gameService.getResult(1);
    if (done) {
      this.postenAbgeschlossen = true;
      this.hatSchnitzel = done.schnitzel === 1;
      this.timer = done.timeSeconds;
      this.timerDisplay = this.formatTime(done.timeSeconds);
      this.wasSkipped = done.skipped;
      this.ergebnisText = done.skipped
        ? '⏭️ Posten übersprungen.'
        : done.schnitzel === 1
          ? `🥩 Schnitzel! Deine Zeit: ${done.timeSeconds}s`
          : `🥔 Kartoffel. Deine Zeit: ${done.timeSeconds}s`;
      return;
    }
    this.gameService.startPosten(1);
    this.timer = this.gameService.getPostenElapsed(1);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(1);
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
          const dist = haversineMeters(
            position.coords.latitude,
            position.coords.longitude,
            TARGET_LAT,
            TARGET_LNG,
          );
          this.distanzMeters = Math.round(dist);

          if (dist <= REACH_RADIUS_M && !this.postenAbgeschlossen) {
            this.abschliessen();
          }
        },
      );
    } catch {
      this.distanzMeters = null;
    }
  }

  private abschliessen(): void {
    clearInterval(this.intervalId);
    if (this.watchId !== null) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.postenAbgeschlossen = true;
    const schnitzel = this.timer <= SCHNITZEL_THRESHOLD_S ? 1 : 0;
    const kartoffel = schnitzel === 1 ? 0 : 1;
    this.hatSchnitzel = schnitzel === 1;
    this.ergebnisText = schnitzel === 1
      ? `🥩 Schnitzel! Ziel in ${this.timer}s erreicht!`
      : `🥔 Kartoffel! Du hast ${this.timer}s gebraucht.`;
    this.gameService.recordResult(1, { schnitzel, kartoffel, skipped: false, timeSeconds: this.timer });
    Haptics.impact({ style: ImpactStyle.Medium });
  }

  postenUeberspringen(): void {
    clearInterval(this.intervalId);
    if (this.watchId !== null) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.gameService.recordResult(1, { schnitzel: 0, kartoffel: 1, skipped: true, timeSeconds: this.timer });
    this.router.navigate(['/posten']);
  }

  postenWiederholen(): void {
    this.gameService.clearResult(1);
    this.postenAbgeschlossen = false;
    this.wasSkipped = false;
    this.ergebnisText = '';
    this.hatSchnitzel = false;
    this.distanzMeters = null;
    this.timer = this.gameService.getPostenElapsed(1);
    this.timerDisplay = this.formatTime(this.timer);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(1);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);
    this.startGps();
  }

  weiter(): void {
    this.router.navigate(['/posten2']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }

  private formatTime(s: number): string {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
}
