import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonToggle, IonButton, IonIcon, IonFooter,
  IonButtons, IonBackButton,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { mapOutline, cameraOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';

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

  constructor(private router: Router) {
    addIcons({ mapOutline, cameraOutline });
  }

  async onGpsToggle(): Promise<void> {
    if (this.gpsEnabled) {
      const permission = await Geolocation.requestPermissions();
      this.gpsEnabled = permission.location === 'granted';
    }
  }

  async onCameraToggle(): Promise<void> {
    if (this.cameraEnabled) {
      const permission = await Camera.requestPermissions({ permissions: ['camera'] });
      this.cameraEnabled = permission.camera === 'granted';
    }
  }

  weiter(): void {
    if (this.allAccepted) {
      this.router.navigate(['/posten']);
    }
  }
}
