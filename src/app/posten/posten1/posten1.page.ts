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
  selector: 'app-posten1',
  templateUrl: './posten1.page.html',
  styleUrls: ['./posten1.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter,
    CommonModule,
  ],
})
export class Posten1Page implements OnInit, OnDestroy {
  title = 'Posten 1';
  description = 'Begib dich zur Migros Mattenhof. Siehe dein Standort';

  timer = 0;
  timerDisplay = '00:00:00';
  private interval: any;
  postenAbgeschlossen = false;

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
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  postenUeberspringen(): void {
    this.postenAbgeschlossen = true;
  }

  weiter(): void {
    this.router.navigate(['/posten2']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }
}
