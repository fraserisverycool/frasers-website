import { Injectable } from '@angular/core';
import {Color} from "../color.interface";

@Injectable({
  providedIn: 'root'
})
export class HomepageColorService {
  private apiUrl = 'https://worldpeace.services/api';

  constructor(private http: HttpClient) { }

  getLatestColor(): Observable<string> {
    return this.http.get<Color[]>(`${this.apiUrl}/homepage-color`).pipe(
      map(colors => {
        if (!colors || colors.length === 0) {
          return '';
        }
        const sorted = [...colors].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        return sorted[0].color;
      })
    );
  }

  getNumberOfChanges(): Observable<number> {
    return this.http.get<Color[]>(`${this.apiUrl}/homepage-color`).pipe(
      map(colors => {
        if (!colors) {
          return 0;
          }
        return colors.length;
        }
      )
    );
  }

  postFeedback(feedback: { comment: string, name: string }): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/homepage-color`, feedback);
  }
}
