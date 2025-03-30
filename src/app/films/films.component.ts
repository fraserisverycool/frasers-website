import { Component, OnInit, Injectable  } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Film {
  filename: string;
  title: string;
  description: string;
  year: string;
}

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule],
  templateUrl: './films.component.html',
  styleUrls: ['./films.component.css']
})
export default class FilmsComponent implements OnInit {
  films: Film[] = [];
  originalFilms: Film[] = [];
  title: string = "Films Fraser has watched since 2013";
  filters = ["all", "2025", "2024", "2023", "random", "alphabetical", "next"];
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadFilms();
  }

  loadFilms(): void {
    this.http.get<{ films: Film[] }>('assets/films/films.json').subscribe({
      next: (data) => {
        this.originalFilms = data.films;
        this.sortFilms('all');

      },
      error: (err) => {
        console.error('Failed to load films:', err);
      },
    });
  }

  get filteredFilms(): Film[] {
    if (!this.searchTerm) {
      return this.films;
    }
    return this.films.filter(film => {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      return film.title.toLowerCase().includes(lowerCaseSearchTerm);
    });
  }

  sortFilms(criteria: string): void {
    switch (criteria) {
      case 'next':
        this.router.navigate(['/films/next']);
        break;
      case 'all':
        this.films = this.originalFilms;
        this.title = "Films Fraser has watched since 2013";
        break;
      case '2025':
        this.films = this.originalFilms.filter(film => film.year.includes('2025'));
        this.title = "Films Fraser watched in 2025";
        break;
      case '2024':
        this.films = this.originalFilms.filter(film => film.year.includes('2024'));
        this.title = "Films Fraser watched in 2024";
        break;
      case '2023':
        this.films = this.originalFilms.filter(film => film.year.includes('2023'));
        this.title = "Films Fraser watched in 2023";
        break;
      case 'random':
        this.films = [...this.originalFilms].sort(() => Math.random() - 0.5);
        this.title = "Films Fraser has watched since 2023 ordered randomly";
        break;
      case 'alphabetical':
        this.films = [...this.originalFilms].sort((a, b) => a.title.localeCompare(b.title));
        this.title = "Films Fraser has watched since 2023 ordered by name";
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
