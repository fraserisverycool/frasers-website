import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Film } from '../film.interface';
import { RatingHydrationService } from '../../utils/rating-bar/service/rating-hydration.service';

@Injectable({
  providedIn: 'root'
})
export class FilmService {
  constructor(
    private http: HttpClient,
    private ratingHydration: RatingHydrationService
  ) {}

  getFilms(hydrateRatings: boolean = true): Observable<Film[]> {
    const films$ = this.http.get<{ films: Film[] }>('assets/data/films.json').pipe(
      map(data => data.films || [])
    );

    if (!hydrateRatings) {
      return films$;
    }

    return films$.pipe(
      switchMap(films => this.ratingHydration.hydrateRatings(films))
    );
  }
}
