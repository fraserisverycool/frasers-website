import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import FilmsComponent from "../films.component";
import { HttpClient } from "@angular/common/http";

interface Film {
  filename: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-four',
  standalone: true,
  imports: [CommonModule, FilmsComponent],
  templateUrl: './four.component.html',
  styleUrls: ['./four.component.css']
})
export default class FourComponent implements OnInit {
  films: Film[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFilms();
  }

  loadFilms(): void {
    this.http.get<{ films: Film[] }>('assets/films/2024.json').subscribe({
      next: (data) => {
        this.films = data.films;
        this.films = this.films.sort(() => -1);
      },
      error: (err) => {
        console.error('Failed to load films:', err);
      },
    });
  }
}
