import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonFooter, IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, qrCodeOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GameService } from '../../services/game.service';

const EXPECTED_QR = 'M335@ICT-BZ';
const SCHNITZEL_THRESHOLD_S = 120;

@Component({
  selector: 'app-posten3',
  templateUrl: './posten3.page.html',
  styleUrls: ['./posten3.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonFooter, IonSpinner, CommonModule,
  ],
})
export class Posten3Page implements OnInit, OnDestroy {
  title = 'Posten 3';
  description = 'Gehe zur Tür des Kursraum und scanne den QR code. Der QR Code hängt an der Türe vor dem reingehen.';
  timer = 0;
  timerDisplay = '00:00:00';
  private interval: any;
  postenAbgeschlossen = false;
  scanFehler = '';
  hatSchnitzel = false;
  wasSkipped = false;
  ergebnisText = '';

  constructor(private router: Router, private gameService: GameService) {
    addIcons({ chevronBack, qrCodeOutline });
  }

  ngOnInit(): void {
    const done = this.gameService.getResult(3);
    if (done) {
      this.postenAbgeschlossen = true;
      this.hatSchnitzel = done.schnitzel === 1;
      this.timer = done.timeSeconds;
      this.timerDisplay = this.formatTime(done.timeSeconds);
      this.wasSkipped = done.skipped;
      this.ergebnisText = done.skipped
        ? '⏭️ Posten übersprungen.'
        : done.schnitzel === 1
          ? `🥩 Schnitzel! Deine Zeit: ${done.timeSeconds}s`
          : `🥔 Kartoffel. Deine Zeit: ${done.timeSeconds}s`;
      return;
    }
      this.timerDisplay = this.formatTime(this.timer);
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


  private abschliessen(): void {
    clearInterval(this.intervalId);
    this.postenAbgeschlossen = true;
    const schnitzel = this.timer <= SCHNITZEL_THRESHOLD_S ? 1 : 0;
    const kartoffel = schnitzel === 1 ? 0 : 1;
    this.hatSchnitzel = schnitzel === 1;
    this.ergebnisText = schnitzel === 1
      ? `🥩 Schnitzel! Code in ${this.timer}s gescannt!`
      : `🥔 Kartoffel! Du hast ${this.timer}s gebraucht.`;
    this.gameService.recordResult(3, { schnitzel, kartoffel, skipped: false, timeSeconds: this.timer });
    Haptics.impact({ style: ImpactStyle.Medium });
  }

  postenUeberspringen(): void {
    clearInterval(this.interval);
    this.gameService.recordResult(3, { schnitzel: 0, kartoffel: 1, skipped: true, timeSeconds: this.timer });
    this.router.navigate(['/posten']);
  }

  weiter(): void {
    this.router.navigate(['/posten4']);
  }

  zurueck(): void {
    this.router.navigate(['/posten']);
  }


  private formatTime(s: number): string {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
}
