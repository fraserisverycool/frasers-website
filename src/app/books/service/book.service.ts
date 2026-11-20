import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Book } from '../book.interface';
import { RatingHydrationService } from '../../utils/rating-bar/service/rating-hydration.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  constructor(
    private http: HttpClient,
    private ratingHydration: RatingHydrationService
  ) {}

  getBooks(hydrateRatings: boolean = true): Observable<Book[]> {
    const books$ = this.http.get<{ books: Book[] }>('assets/data/books.json').pipe(
      map(data => data.books || [])
    );

    if (!hydrateRatings) {
      return books$;
    }

    return books$.pipe(
      switchMap(books => this.ratingHydration.hydrateRatings(books))
    );
  }
}
