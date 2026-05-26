import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter, IonProgressBar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-posten6',
  templateUrl: './posten6.page.html',
  styleUrls: ['./posten6.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, IonProgressBar, CommonModule
  ]
})
export class Posten6Page implements OnInit, OnDestroy {
  title = 'Posten 6';
  description = 'Verbinde dich mit einem Netzwerk und trenne dich anschliessend wieder';

  timer = 0;
  timerDisplay = '00:00:00';
  private interval: any;
  private networkInterval: any;
  postenAbgeschlossen = false;

  /** 1 = verbinden, 2 = trennen, 3 = fertig */
  currentStep: 1 | 2 | 3 = 1;
  private wasConnected: boolean | null = null;

  readonly steps = [
    { id: 1, label: 'Verbinde dich mit einem Netzwerk' },
    { id: 2, label: 'Trenne dich vom Netzwerk' },
  ];

  constructor(private router: Router) {
    addIcons({ chevronBack });
  }

  async ngOnInit(): Promise<void> {
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

    // Wenn man schon verbunden ist, direkt bei Schritt 2 starten.
    const status = await Network.getStatus();
    this.wasConnected = status.connected === true;
    if (this.wasConnected) {
      this.currentStep = 2;
    }

    this.networkInterval = setInterval(() => this.checkNetwork(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    clearInterval(this.networkInterval);
  }

  private async checkNetwork(): Promise<void> {
    if (this.postenAbgeschlossen) {
      return;
    }

    const status = await Network.getStatus();
    const isConnected = status.connected === true;

    // Schritt 1 → 2: Übergang von "nicht verbunden" zu "verbunden"
    if (this.currentStep === 1 && this.wasConnected === false && isConnected) {
      this.currentStep = 2;
    }
    // Schritt 2 → fertig: Übergang von "verbunden" zu "nicht verbunden"
    else if (this.currentStep === 2 && this.wasConnected === true && !isConnected) {
      this.currentStep = 3;
      this.postenAbgeschlossen = true;
      clearInterval(this.networkInterval);
    }

    this.wasConnected = isConnected;
  }

  get progress(): number {
    if (this.currentStep === 1) return 0;
    if (this.currentStep === 2) return 0.5;
    return 1;
  }

  postenUeberspringen(): void {
    this.postenAbgeschlossen = true;
    this.currentStep = 3;
    clearInterval(this.networkInterval);
  }

  weiter(): void {
    this.router.navigate(['/posten']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }
}
