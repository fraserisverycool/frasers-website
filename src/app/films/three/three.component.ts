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
  selector: 'app-three',
  standalone: true,
  imports: [CommonModule, FilmsComponent],
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.css']
})
export default class ThreeComponent implements OnInit {
  films: Film[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFilms();
  }

  loadFilms(): void {
    this.http.get<{ films: Film[] }>('assets/films/2023.json').subscribe({
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
