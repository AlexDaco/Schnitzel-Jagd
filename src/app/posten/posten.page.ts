import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { Router } from '@angular/router';
import { TimerService } from '../services/timer.service';

const POSTEN_DATA = [
  { id: 1, title: 'Posten 1', description: 'Begib dich zur Migros Mattenhof', icon: '🛒' },
  { id: 2, title: 'Posten 2', description: 'Bewege dich 20 meter von deinem Standort weg', icon: '📍' },
  { id: 3, title: 'Posten 3', description: 'Gehe zur Kursraumtür und scanne den QR Code', icon: '📷' },
  { id: 4, title: 'Posten 4', description: 'Halte dein Handy kopfüber', icon: '📱' },
  { id: 5, title: 'Posten 5', description: 'Schliesse dein Handy ans Strom an', icon: '⚡' },
  { id: 6, title: 'Posten 6', description: 'Verbinde dich mit dem WLAN', icon: '🛜' },
];

@Component({
  selector: 'app-posten',
  templateUrl: './posten.page.html',
  styleUrls: ['./posten.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, IonList, IonItem, IonLabel,
    CommonModule,
  ],
})
export class PostenPage implements OnInit {
  private readonly timerService = inject(TimerService);
  private readonly router = inject(Router);

  postenList = POSTEN_DATA;

  readonly timerDisplay = computed(() =>
    this.timerService.format(this.timerService.elapsed()),
  );

  constructor() {
    addIcons({ chevronBack });
  }

  ngOnInit(): void {
    this.timerService.start();
  }

  openPosten(id: number): void {
    this.router.navigate(['/posten' + id]);
  }

  schnitzeljagdBeenden(): void {
    this.timerService.stop();
    this.router.navigate(['/home']);
  }
}
