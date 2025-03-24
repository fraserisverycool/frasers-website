import { Component, OnInit, Injectable  } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RouterLink, RouterOutlet, Router } from '@angular/router';

interface Film {
  filename: string;
  title: string;
  description: string;
  year: string;
}

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './films.component.html',
  styleUrls: ['./films.component.css']
})
export default class FilmsComponent implements OnInit {
  films: Film[] = [];
  originalFilms: Film[] = [];
  title: string = "Films Fraser watched in 2025";
  years = ["2025", "2024", "2023"];
  buttons = ["random", "name", "next"];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadFilms();
  }

  loadFilms(): void {
    this.http.get<{ films: Film[] }>('assets/films/films.json').subscribe({
      next: (data) => {
        this.originalFilms = data.films;
        this.sortFilms('2025');

      },
      error: (err) => {
        console.error('Failed to load films:', err);
      },
    });
  }

  sortFilms(criteria: string): void {
    switch (criteria) {
      case 'next':
        this.router.navigate(['/films/next']);
        break;
      case '2025':
        this.films = this.originalFilms.filter(film => film.year.includes('2025'));
        this.films = this.films.sort(() => -1);
        this.title = "Films Fraser watched in 2025";
        break;
      case '2024':
        this.films = this.originalFilms.filter(film => film.year.includes('2024'));
        this.films = this.films.sort(() => -1);
        this.title = "Films Fraser watched in 2024";
        break;
      case '2023':
        this.films = this.originalFilms.filter(film => film.year.includes('2023'));
        this.films = this.films.sort(() => -1);
        this.title = "Films Fraser watched in 2023";
        break;
      case 'random':
        this.films = [...this.originalFilms].sort(() => Math.random() - 0.5);
        this.title = "Films Fraser has watched since 2023 ordered randomly";
        break;
      case 'name':
        this.films = [...this.originalFilms].sort((a, b) => a.title.localeCompare(b.title));
        this.title = "Films Fraser has watched since 2023 ordered by name";
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
