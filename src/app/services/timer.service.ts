import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private startTime: number | null = null;
  private intervalId: any = null;

  readonly elapsed = signal(0);

  start(): void {
    if (this.startTime !== null) {
      return;
    }
    this.startTime = Date.now();
    this.elapsed.set(0);
    this.intervalId = setInterval(() => {
      if (this.startTime !== null) {
        this.elapsed.set(Math.floor((Date.now() - this.startTime) / 1000));
      }
    }, 1000);
  }

  stop(): number {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    const final = this.elapsed();
    return final;
  }

  reset(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.startTime = null;
    this.elapsed.set(0);
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }

  format(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
}
