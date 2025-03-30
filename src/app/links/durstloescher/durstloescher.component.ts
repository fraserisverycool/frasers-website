import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { RouterLink, RouterOutlet } from '@angular/router';

interface Durstloescher {
  filename: string;
  name: string;
  score: string;
  description: string;
}

@Component({
  selector: 'app-durstloescher',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './durstloescher.component.html',
  styleUrls: ['./durstloescher.component.css']
})
export default class DurstloescherComponent implements OnInit {
  durstloescher: Durstloescher[] = [];
  originalDurstloescher: Durstloescher[] = [];
  selectedDurstloescher: Durstloescher | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDurstloescher();
  }

  loadDurstloescher(): void {
    this.http.get<{ durstloescher: Durstloescher[] }>('assets/links/durstloescher/durstloescher.json').subscribe({
      next: (data) => {
        this.originalDurstloescher = data.durstloescher;
        this.sortDurstloescher('post');
      },
      error: (err) => {
        console.error('Failed to load durstloescher:', err);
      },
    });
  }

  showDescription(durstloescher: Durstloescher): void {
    this.selectedDurstloescher = durstloescher;
  }

  closeDescription(): void {
    this.selectedDurstloescher = null;
  }

  sortDurstloescher(criteria: 'random' | 'post' | 'alphabeticalName' | 'score'): void {
    switch (criteria) {
      case 'post':
        this.durstloescher = this.originalDurstloescher;
        break;
      case 'random':
        this.durstloescher = [...this.originalDurstloescher].sort(() => Math.random() - 0.5);
        break;
      case 'alphabeticalName':
        this.durstloescher = [...this.originalDurstloescher].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'score':
        this.durstloescher = [...this.originalDurstloescher].sort((a, b) => {
          const scoreA = parseInt(a.score, 10);
          const scoreB = parseInt(b.score, 10);
          return scoreB - scoreA;
        });
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
