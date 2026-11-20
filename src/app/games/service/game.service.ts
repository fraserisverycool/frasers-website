import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Game } from '../game.interface';
import { RatingHydrationService } from '../../utils/rating-bar/service/rating-hydration.service';

export const PLATFORM_ORDER: string[] = [
  "Game and Watch",
  "NES",
  "Gameboy",
  "SNES",
  "Nintendo 64",
  "Gameboy Advance",
  "Gamecube",
  "DS",
  "Wii",
  "3DS",
  "Wii U",
  "Switch",
  "Switch 2",
  "PlayStation 1",
  "PlayStation 2",
  "PlayStation 3",
  "PlayStation 4",
  "PlayStation 5",
  "Xbox",
  "Xbox 360",
  "Xbox Gamepass",
  "Xbox Series X",
  "PC",
  "Arcade",
  "Sega Mega Drive",
  "Mobile"
];

export const PLATFORM_RANK: Record<string, number> = PLATFORM_ORDER.reduce((acc, platform, index) => {
  acc[platform] = index;
  return acc;
}, {} as Record<string, number>);

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);
  private ratingHydration = inject(RatingHydrationService);


  getGames(hydrateRatings: boolean = true): Observable<Game[]> {
    const games$ = this.http.get<{ games: any[] }>('assets/data/games.json').pipe(
      map(data => {
        return (data.games || [])
          .filter((game: any) => game.review && game.review.length > 0)
          .map((game: any) => {
            const vibes = parseInt(game.vibes, 10);
            const gameplay = parseInt(game.gameplay, 10);
            return {
              ...game,
              vibes: isNaN(vibes) ? 0 : vibes,
              gameplay: isNaN(gameplay) ? 0 : gameplay,
            } as Game;
          });
      }),
      catchError(err => {
        console.error('Failed to load games:', err);
        return of([] as Game[]);
      })
    );

    if (!hydrateRatings) {
      return games$;
    }

    return games$.pipe(
      switchMap(games => this.ratingHydration.hydrateRatings(games))
    );
  }
}
