import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Feedback} from "../feedback.interface";

@Injectable({
  providedIn: 'root'
})
export class GuestbookService {
  private apiUrl = 'https://worldpeace.services/api';

  constructor(private http: HttpClient) { }

  getFeedback(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/feedback`);
  }

  postFeedback(feedback: { comment: string, name: string }): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/feedback`, feedback);
  }
}
