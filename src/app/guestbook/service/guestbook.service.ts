import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Feedback} from "../feedback.interface";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GuestbookService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  getFeedback(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/feedback`);
  }

  postFeedback(feedback: { comment: string, name: string, color: string }): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/feedback`, feedback);
  }
}
