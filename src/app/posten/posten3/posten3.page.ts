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
const SCHNITZEL_THRESHOLD_S = 60;

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
  timer = 0;
  timerDisplay = '00:00';
  postenAbgeschlossen = false;
  wasSkipped = false;
  scanFehler = '';
  ergebnisText = '';
  hatSchnitzel = false;
  moduleLaden = false;

  private intervalId: any;

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
    this.gameService.startPosten(3);
    this.timer = this.gameService.getPostenElapsed(3);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(3);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  async qrScannen(): Promise<void> {
    this.scanFehler = '';

    // 1. Camera permission via the BarcodeScanner plugin itself (MLKit has its own check)
    try {
      const perm = await BarcodeScanner.requestPermissions();
      if (perm.camera !== 'granted') {
        this.scanFehler = 'Kamera-Berechtigung fehlt. Bitte in den Einstellungen erlauben.';
        return;
      }
    } catch {
      this.scanFehler = 'Kamera-Berechtigung konnte nicht abgefragt werden.';
      return;
    }

    // 2. Google Barcode Scanner Module check (needed on some Android devices)
    try {
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) {
        this.moduleLaden = true;
        this.scanFehler = 'Scanner-Modul wird installiert… bitte danach nochmals tippen.';
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        this.moduleLaden = false;
        return;
      }
    } catch {
      // Module check failed silently — try scan anyway
    }

    // 3. Scan
    try {
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });
      if (barcodes.length > 0) {
        const wert = barcodes[0].rawValue;
        if (wert === EXPECTED_QR) {
          this.abschliessen();
        } else {
          this.scanFehler = 'Ups! Falscher QR-Code.';
        }
      } else {
        this.scanFehler = 'Kein QR-Code gefunden. Nochmals versuchen.';
      }
    } catch (e: any) {
      this.scanFehler = 'Scan abgebrochen oder fehlgeschlagen.';
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
    clearInterval(this.intervalId);
    this.gameService.recordResult(3, { schnitzel: 0, kartoffel: 1, skipped: true, timeSeconds: this.timer });
    this.router.navigate(['/posten']);
  }

  postenWiederholen(): void {
    this.gameService.clearResult(3);
    this.postenAbgeschlossen = false;
    this.wasSkipped = false;
    this.ergebnisText = '';
    this.hatSchnitzel = false;
    this.scanFehler = '';
    this.timer = this.gameService.getPostenElapsed(3);
    this.timerDisplay = this.formatTime(this.timer);
    this.intervalId = setInterval(() => {
      this.timer = this.gameService.getPostenElapsed(3);
      this.timerDisplay = this.formatTime(this.timer);
    }, 1000);
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
