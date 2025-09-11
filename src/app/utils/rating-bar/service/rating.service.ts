import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Rating} from "./rating.interface";

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getRatingsById(ids: string[]): Observable<Rating[]> {
    return this.http.post<Rating[]>(`${this.apiUrl}/ratings`, { ids });
  }

  updateRating(rating: Rating): void {
    this.http.put(`${this.apiUrl}/ratings/${rating.id}`, rating.ratings).subscribe()
  }
}
