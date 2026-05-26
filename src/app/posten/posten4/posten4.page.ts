import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posten4',
  templateUrl: './posten4.page.html',
  styleUrls: ['./posten4.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, CommonModule
  ]
})
export class Posten4Page implements OnInit, OnDestroy {
  title = 'Posten 4';
  description = 'Dreh dein Smartphone auf den Kopf';

  timer = 0;
  timerDisplay = '00:00:00';
  private interval: any;
  postenAbgeschlossen = false;
  istKopfueber = false;

  constructor(private router: Router) {
    addIcons({ chevronBack });
  }

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.timer++;
      const h = Math.floor(this.timer / 3600);
      const m = Math.floor((this.timer % 3600) / 60);
      const s = this.timer % 60;
      this.timerDisplay =
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0');
    }, 1000);

    window.addEventListener('deviceorientation', this.onOrientation);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    window.removeEventListener('deviceorientation', this.onOrientation);
  }

  fortschritt = 0;

  onOrientation = (event: DeviceOrientationEvent): void => {
    const beta = event.beta ?? 0;
    const absBeta = Math.abs(beta);

    this.fortschritt = Math.min(100, Math.round((absBeta / 180) * 100));

    if (absBeta > 170 && !this.postenAbgeschlossen) {
      this.istKopfueber = true;
      this.postenAbgeschlossen = true;
      this.fortschritt = 100;
    }
  }

  postenUeberspringen(): void {
    this.postenAbgeschlossen = true;
  }

  weiter(): void {
    this.router.navigate(['/posten5']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }
}
