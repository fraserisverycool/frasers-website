import {Injectable} from '@angular/core';
import {Color} from "../color.interface";
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {catchError, map, tap} from "rxjs/operators";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomepageColorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLatestColor(): Observable<{latest: string, total: number}> {
    console.log(this.apiUrl + "/homepage");
    return this.http.get<Color[]>(`${this.apiUrl}/homepage`).pipe(
      map(colors => {
        if (!colors || colors.length === 0) {
          return { latest: '', total: 0 };
        }
        const sorted = [...colors].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        console.log(sorted[0].color);
        return { latest: sorted[0].color, total: colors.length };
      }),
      catchError(error => {
        console.error('Error fetching homepage colour:', error);
        return of({latest: '', total: 0});
      })
    );
  }

  test(): Observable<Color[]> {
    return this.http.get<Color[]>(`${this.apiUrl}/homepage`);
  }

  postColor(color: { color: string }): Observable<Color> {
    console.log(color);
    return this.http.post<Color>(`${this.apiUrl}/homepage`, color).pipe(
      tap({
        error: (error) => console.error('Error posting colour:', error),
      }),
      catchError( () => of({ color: '#ffffff', timestamp: new Date().toISOString() }))
    );
  }
}
