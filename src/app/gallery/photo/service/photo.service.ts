import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {Secret} from "../secret.interface";
import {Photo} from "../../photo.interface";
import {RatingHydrationService} from "../../../utils/rating-bar/service/rating-hydration.service";

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private ratingHydration: RatingHydrationService
  ) { }

  postAnswer(id: string, answer: string): Observable<Secret> {
    return this.http.post<Secret>(`${this.apiUrl}/anecdote/${id}`, { answer: answer });
  }

  getPhotos(hydrateRatings: boolean = true): Observable<Photo[]> {
    const data$ = this.http.get<{ pictures: Photo[] }>('assets/data/photos.json').pipe(
      map(res => res.pictures || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }
}
