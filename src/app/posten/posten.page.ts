import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonFooter,
  IonButtons, IonBackButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-posten',
  templateUrl: './posten.page.html',
  styleUrls: ['./posten.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonFooter,
    IonButtons, IonBackButton,
    CommonModule,
  ],
})
export class PostenPage implements OnInit, OnDestroy {
  title = 'Posten 1';
  description = 'Begib dich zur Migros Mattenhof. Siehe dein Standort';
  mapImage = 'assets/map.png';

  timer = 0;
  timerDisplay = '00:00:00';
  private interval: any;

  postenAbgeschlossen = false;

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
    console.log('Weiter zum nächsten Posten');
  }
}
