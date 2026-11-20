import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Newsletter } from '../newsletter.interface';
import { RatingHydrationService } from '../../utils/rating-bar/service/rating-hydration.service';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private http = inject(HttpClient);
  private ratingHydration = inject(RatingHydrationService);


  getNewsletterByTimestamp(timestamp: string): Observable<Newsletter | null> {
    return this.http.get<Newsletter>(`assets/newsletter/newsletter-${timestamp}.json`).pipe(
      catchError(err => {
        console.error(`Failed to load newsletter for timestamp ${timestamp}:`, err);
        return of(null);
      })
    );
  }

  getNewsletters(hydrateRatings: boolean = true): Observable<Newsletter[]> {
    const list$ = this.http.get<{ newsletters: string[] }>('assets/data/newsletters.json').pipe(
      catchError(err => {
        console.error('Failed to load newsletters list:', err);
        return of({ newsletters: [] });
      }),
      switchMap(data => {
        const filenames = data.newsletters || [];
        if (filenames.length === 0) {
          return of([] as Newsletter[]);
        }

        const requests = filenames.map(filename =>
          this.http.get<Newsletter>(`assets/newsletter/${filename}`).pipe(
            catchError(err => {
              console.error(`Failed to load newsletter file ${filename}:`, err);
              return of(null);
            })
          )
        );

        return forkJoin(requests).pipe(
          map(results => {
            const valid = results.filter((item): item is Newsletter => item !== null);
            valid.sort((a, b) => {
              const parse = (s: string) => {
                const [d, m, y] = s.split('-').map(Number);
                return new Date(y, m - 1, d);
              };
              return parse(b.timestamp).getTime() - parse(a.timestamp).getTime();
            });
            return valid;
          })
        );
      })
    );

    if (!hydrateRatings) {
      return list$;
    }

    return list$.pipe(
      switchMap(newsletters => this.ratingHydration.hydrateRatings(newsletters))
    );
  }
}
