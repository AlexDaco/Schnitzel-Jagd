import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, qrCodeOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

const EXPECTED_QR = 'M335@ICT-BZ';

@Component({
  selector: 'app-posten3',
  templateUrl: './posten3.page.html',
  styleUrls: ['./posten3.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, CommonModule
  ]
})
export class Posten3Page implements OnInit, OnDestroy {
  title = 'Posten 3';
  description = 'Gehe zur Tür des Kursraum und scanne den QR code. Der QR Code hängt an der Türe vor dem reingehen.';
  timer = 0;
  timerDisplay = '00:00:00';
  private interval: any;
  postenAbgeschlossen = false;
  scanFehler = '';

  constructor(private router: Router) {
    addIcons({ chevronBack, qrCodeOutline });
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

  async qrScannen(): Promise<void> {
    this.scanFehler = '';
    try {
      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes.length > 0) {
        const wert = barcodes[0].rawValue;
        if (wert === EXPECTED_QR) {
          this.postenAbgeschlossen = true;
        } else {
          this.scanFehler = 'Falscher QR-Code. Bitte den richtigen scannen.';
        }
      }
    } catch (e) {
      this.scanFehler = 'Kamera konnte nicht geöffnet werden.';
    }
  }

  postenUeberspringen(): void {
    this.postenAbgeschlossen = true;
  }

  weiter(): void {
    this.router.navigate(['/posten4']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }
}
