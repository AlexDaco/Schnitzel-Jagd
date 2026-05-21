import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { LeaderboardEntry } from '../models/leaderboard-entry';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  /** Mock-Daten – wird später durch echte Persistenz / API ersetzt */
  private entries: LeaderboardEntry[] = [
    { id: 1, name: 'Samira', schnitzel: 5, kartoffeln: 1, dauerSekunden: 271,  datum: new Date('2026-03-02') },
    { id: 2, name: 'David',  schnitzel: 5, kartoffeln: 1, dauerSekunden: 301,  datum: new Date('2026-03-02') },
    { id: 3, name: 'Alex',   schnitzel: 5, kartoffeln: 1, dauerSekunden: 382,  datum: new Date('2026-03-02') },
    { id: 4, name: 'Bene',   schnitzel: 4, kartoffeln: 2, dauerSekunden: 920,  datum: new Date('2026-03-04') },
    { id: 5, name: 'Carla',  schnitzel: 3, kartoffeln: 3, dauerSekunden: 1100, datum: new Date('2026-03-05') },
  ];

  getEntries(): Observable<LeaderboardEntry[]> {
    return of(this.sortByRank(this.entries));
  }

  addEntry(entry: LeaderboardEntry): void {
    this.entries.push(JSON.parse(JSON.stringify(entry)));
  }


  playerExists(name: string): boolean {
    const normalized = name.trim().toLowerCase();
    return this.entries.some(e => e.name.trim().toLowerCase() === normalized);
  }

  private sortByRank(list: LeaderboardEntry[]): LeaderboardEntry[] {
    return [...list].sort((a, b) => {
      if (b.schnitzel !== a.schnitzel) return b.schnitzel - a.schnitzel;
      if (a.kartoffeln !== b.kartoffeln) return a.kartoffeln - b.kartoffeln;
      return a.dauerSekunden - b.dauerSekunden;
    });
  }
}
