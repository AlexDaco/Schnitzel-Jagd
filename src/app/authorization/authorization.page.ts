import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonToggle, IonButton, IonIcon, IonFooter,
  IonButtons,
  ToastController,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { mapOutline, cameraOutline, chevronBack, phonePortraitOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-authorization',
  templateUrl: 'authorization.page.html',
  styleUrls: ['authorization.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonToggle, IonButton, IonIcon, IonFooter,
    IonButtons,
    FormsModule,
  ],
})
export class AuthorizationPage {
  private readonly playerService = inject(PlayerService);
  private readonly toastCtrl    = inject(ToastController);
  private readonly router        = inject(Router);

  gpsEnabled    = false;
  cameraEnabled = false;
  motionEnabled = false;

  get allAccepted(): boolean {
    return this.gpsEnabled && this.cameraEnabled && this.motionEnabled;
  }

  constructor() {
    addIcons({ mapOutline, cameraOutline, chevronBack, phonePortraitOutline });
  }

  async onGpsToggle(): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Light });

    if (!this.gpsEnabled) return;

    try {
      // 'location' maps to ACCESS_FINE_LOCATION (precise GPS)
      const permission = await Geolocation.requestPermissions({ permissions: ['location'] });
      const granted = permission.location === 'granted';

      if (granted) {
        this.gpsEnabled = true;
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        this.gpsEnabled = false;
        await Haptics.notification({ type: NotificationType.Error });
        // On Android 12+ the user might have selected "Approximate" instead of "Precise"
        const msg = permission.coarseLocation === 'granted'
          ? 'Bitte "Genauen Standort" (nicht nur Ungefähr) erlauben — benötigt für Posten 1 & 2'
          : 'GPS wurde verweigert. Bitte in den Einstellungen "Genauen Standort" erlauben.';
        await this.showDeniedToast(msg);
      }
    } catch (e) {
      this.gpsEnabled = false;
      await Haptics.notification({ type: NotificationType.Error });
      await this.showDeniedToast('GPS-Fehler: Bitte in den Einstellungen erlauben.');
    }
  }

  async onCameraToggle(): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Light });

    if (!this.cameraEnabled) return;

    try {
      // Grant system camera permission first
      const permission = await Camera.requestPermissions({ permissions: ['camera'] });
      // Also initialise the BarcodeScanner plugin's own permission state so Posten 3 works
      const barcodePermission = await BarcodeScanner.requestPermissions();
      this.cameraEnabled =
        permission.camera === 'granted' && barcodePermission.camera === 'granted';

      if (this.cameraEnabled) {
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        await Haptics.notification({ type: NotificationType.Error });
        await this.showDeniedToast('Kamera wurde verweigert. Bitte in den Einstellungen erlauben. (Posten 3 – QR-Code)');
      }
    } catch {
      this.cameraEnabled = false;
      await Haptics.notification({ type: NotificationType.Error });
    }
  }

  async onMotionToggle(): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Light });

    if (!this.motionEnabled) return;

    // iOS 13+ needs explicit permission; Android grants automatically
    if (typeof (DeviceMotionEvent as any)['requestPermission'] === 'function') {
      try {
        const result: string = await (DeviceMotionEvent as any)['requestPermission']();
        this.motionEnabled = result === 'granted';
      } catch {
        this.motionEnabled = false;
      }
    } else {
      // On Android the DeviceOrientation API works without a permission prompt
      this.motionEnabled = true;
    }

    if (this.motionEnabled) {
      await Haptics.notification({ type: NotificationType.Success });
    } else {
      await Haptics.notification({ type: NotificationType.Error });
      await this.showDeniedToast('Bewegungssensor', 'Benötigt für Posten 4');
    }
  }

  weiter(): void {
    if (this.allAccepted) {
      this.router.navigate(['/posten']);
    }
  }

  zurueck(): void {
    this.playerService.clearPlayer();
    this.router.navigate(['/home']);
  }

  private async showDeniedToast(message: string, hint?: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: hint ? `${message} (${hint})` : message,
      duration: 3500,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }
}
