import { Injectable } from '@angular/core';

export interface PostenResult {
  schnitzel: number;
  kartoffel: number;
  skipped: boolean;
  timeSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private results = new Map<number, PostenResult>();
  private postenStartMs = new Map<number, number>();
  gameStartDate: Date = new Date();

  startNewGame(): void {
    this.results.clear();
    this.postenStartMs.clear();
    this.gameStartDate = new Date();
  }

  /** Records start timestamp for a posten the first time it is entered. */
  startPosten(postenId: number): void {
    if (!this.postenStartMs.has(postenId)) {
      this.postenStartMs.set(postenId, Date.now());
    }
  }

  /** Elapsed seconds since the posten was first entered. */
  getPostenElapsed(postenId: number): number {
    const start = this.postenStartMs.get(postenId);
    return start === undefined ? 0 : Math.floor((Date.now() - start) / 1000);
  }

  clearResult(postenId: number): void {
    this.results.delete(postenId);
  }

  recordResult(postenId: number, result: PostenResult): void {
    this.results.set(postenId, result);
  }

  getResult(postenId: number): PostenResult | undefined {
    return this.results.get(postenId);
  }

  isPostenDone(postenId: number): boolean {
    return this.results.has(postenId);
  }

  alleDone(): boolean {
    return this.results.size >= 6;
  }

  getTotalSchnitzel(): number {
    return Array.from(this.results.values()).reduce((s, r) => s + r.schnitzel, 0);
  }

  getTotalKartoffel(): number {
    return Array.from(this.results.values()).reduce((s, r) => s + r.kartoffel, 0);
  }
}
