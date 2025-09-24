import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {Secret} from "../secret.interface";

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  postAnswer(id: string, answer: string): Observable<Secret> {
    return this.http.post<Secret>(`${this.apiUrl}/anecdote/${id}`, { answer: answer });
  }

}
