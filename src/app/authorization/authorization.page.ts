import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonToggle, IonButton, IonIcon, IonFooter,
  IonButtons, IonBackButton,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { mapOutline, cameraOutline } from 'ionicons/icons';

@Component({
  selector: 'app-authorization',
  templateUrl: 'authorization.page.html',
  styleUrls: ['authorization.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonToggle, IonButton, IonIcon, IonFooter,
    IonButtons, IonBackButton,
    FormsModule,
  ],
})
export class AuthorizationPage {
  gpsEnabled = false;
  cameraEnabled = false;

  get allAccepted(): boolean {
    return this.gpsEnabled && this.cameraEnabled;
  }

  constructor() {
    addIcons({ mapOutline, cameraOutline });
  }

  weiter(): void {
    if (this.allAccepted) {
      console.log('Weiter...');
    }
  }
}
