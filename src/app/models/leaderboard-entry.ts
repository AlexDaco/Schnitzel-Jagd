/**
 * Ein Eintrag im Leaderboard.
 * Repräsentiert einen abgeschlossenen Schnitzeljagd-Durchlauf eines Spielers.
 */
export interface LeaderboardEntry {
  id: number;

  name: string;

  schnitzel: number;

  kartoffeln: number;

  dauerSekunden: number;

  datum: Date;
}
