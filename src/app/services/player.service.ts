import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private currentPlayer: string | null = null;

  setPlayerName(name: string): void {
    this.currentPlayer = name.trim();
  }

  getPlayerName(): string | null {
    return this.currentPlayer;
  }

  hasPlayer(): boolean {
    return this.currentPlayer !== null && this.currentPlayer.length > 0;
  }

  clearPlayer(): void {
    this.currentPlayer = null;
  }
}
