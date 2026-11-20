import { Injectable, inject } from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {RatingService} from './rating.service';
import {RateableEntity} from './rateable-entity.interface';

@Injectable({
  providedIn: 'root'
})
export class RatingHydrationService {
  private ratingService = inject(RatingService);


  hydrateRatings<T extends RateableEntity>(items: T[]): Observable<T[]> {
    if (!items || items.length === 0) {
      return of([]);
    }

    const ids = items.map(item => item.id).filter(Boolean);
    if (ids.length === 0) {
      return of(items.map(item => ({
        ...item,
        rating: item.rating ?? [0, 0, 0, 0, 0, 0]
      })));
    }

    return this.ratingService.getRatingsById(ids).pipe(
      map(ratings => {
        const ratingMap = new Map<string, number[]>();
        for (const r of ratings || []) {
          ratingMap.set(r.id, r.ratings);
        }
        return items.map(item => ({
          ...item,
          rating: ratingMap.get(item.id) ?? [0, 0, 0, 0, 0, 0]
        }));
      }),
      catchError(err => {
        console.error('Failed to hydrate ratings:', err);
        return of(items.map(item => ({
          ...item,
          rating: item.rating ?? [0, 0, 0, 0, 0, 0]
        })));
      })
    );
  }
}

export function enrichWithRatings<T extends RateableEntity>(
  ratingHydrationService: RatingHydrationService
): (source$: Observable<T[]>) => Observable<T[]> {
  return (source$: Observable<T[]>): Observable<T[]> => {
    return source$.pipe(
      switchMap(items => ratingHydrationService.hydrateRatings(items))
    );
  };
}
