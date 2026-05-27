import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LeaderboardEntry } from '../models/leaderboard-entry';

const STORAGE_KEY = 'schnitzel-jagd-leaderboard';

const MOCK_ENTRIES: LeaderboardEntry[] = [
  { id: 1, name: 'Samira', schnitzel: 6, kartoffeln: 0, dauerSekunden: 271,  datum: new Date('2026-03-02') },
  { id: 2, name: 'David',  schnitzel: 5, kartoffeln: 1, dauerSekunden: 301,  datum: new Date('2026-03-02') },
  { id: 3, name: 'Alex',   schnitzel: 5, kartoffeln: 1, dauerSekunden: 382,  datum: new Date('2026-03-02') },
  { id: 4, name: 'Bene',   schnitzel: 4, kartoffeln: 2, dauerSekunden: 920,  datum: new Date('2026-03-04') },
  { id: 5, name: 'Carla',  schnitzel: 3, kartoffeln: 3, dauerSekunden: 1100, datum: new Date('2026-03-05') },
];

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly http = inject(HttpClient);
  private entries: LeaderboardEntry[] = this.loadFromStorage();

  getEntries(): Observable<LeaderboardEntry[]> {
    return of(this.sortByRank(this.entries));
  }

  addEntry(entry: LeaderboardEntry): void {
    this.entries.push(JSON.parse(JSON.stringify(entry)));
    this.saveToStorage();
    this.submitToApi(entry);
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

  private loadFromStorage(): LeaderboardEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LeaderboardEntry[];
        return parsed.map(e => ({ ...e, datum: new Date(e.datum) }));
      }
    } catch {
      // ignore parse errors
    }
    return [...MOCK_ENTRIES];
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      // ignore storage errors
    }
  }

  private submitToApi(entry: LeaderboardEntry): void {
    const h = Math.floor(entry.dauerSekunden / 3600);
    const m = Math.floor((entry.dauerSekunden % 3600) / 60);
    const s = entry.dauerSekunden % 60;
    const duration = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    const body = new URLSearchParams({
      'entry.1860183935': entry.name,
      'entry.564282981':  String(entry.schnitzel),
      'entry.1079317865': String(entry.kartoffeln),
      'entry.985590604':  duration,
    }).toString();

    this.http
      .post(
        'https://docs.google.com/forms/u/0/d/e/1FAIpQLSe_rr4dfM11mWhSKwbjwoIzEDPi9ahrEsAsHhESicJ9zS9lTw/formResponse',
        body,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, responseType: 'text' },
      )
      .pipe(catchError(() => of(null)))
      .subscribe();
  }
}
