import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter, IonProgressBar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Device } from '@capacitor/device';

@Component({
  selector: 'app-posten5',
  templateUrl: './posten5.page.html',
  styleUrls: ['./posten5.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, IonProgressBar, CommonModule
  ]
})
export class Posten5Page implements OnInit, OnDestroy {
  title = 'Posten 5';
  description = 'Stecke dein Handy ans Ladekabel und entferne es anschliessend wieder';

  timer = 0;
  timerDisplay = '00:00:00';
  private interval: any;
  private batteryInterval: any;
  postenAbgeschlossen = false;

  /** 1 = einstecken, 2 = ausstecken, 3 = fertig */
  currentStep: 1 | 2 | 3 = 1;
  private wasCharging: boolean | null = null;

  readonly steps = [
    { id: 1, label: 'Stecke dein Handy ans Ladekabel' },
    { id: 2, label: 'Entferne das Ladekabel wieder' },
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

    // Wenn das Handy schon am Laden ist, direkt bei Schritt 2 starten.
    const info = await Device.getBatteryInfo();
    this.wasCharging = info.isCharging === true;
    if (this.wasCharging) {
      this.currentStep = 2;
    }

    this.batteryInterval = setInterval(() => this.checkBattery(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    clearInterval(this.batteryInterval);
  }

  private async checkBattery(): Promise<void> {
    if (this.postenAbgeschlossen) {
      return;
    }

    const info = await Device.getBatteryInfo();
    const isCharging = info.isCharging === true;

    // Schritt 1 → 2: Übergang von "nicht laden" zu "laden"
    if (this.currentStep === 1 && this.wasCharging === false && isCharging) {
      this.currentStep = 2;
    }
    // Schritt 2 → fertig: Übergang von "laden" zu "nicht laden"
    else if (this.currentStep === 2 && this.wasCharging === true && !isCharging) {
      this.currentStep = 3;
      this.postenAbgeschlossen = true;
      clearInterval(this.batteryInterval);
    }

    this.wasCharging = isCharging;
  }

  get progress(): number {
    if (this.currentStep === 1) return 0;
    if (this.currentStep === 2) return 0.5;
    return 1;
  }

  postenUeberspringen(): void {
    this.postenAbgeschlossen = true;
    this.currentStep = 3;
    clearInterval(this.batteryInterval);
  }

  weiter(): void {
    this.router.navigate(['/posten6']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }
}
