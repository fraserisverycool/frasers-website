import { Component, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import {Durstloescher} from "./durstloescher.interface";
import {DurstloescherModalComponent} from "./durstloescher-model/durstloescher-modal.component";
import {RatingHydrationService} from "../../utils/rating-bar/service/rating-hydration.service";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-durstloescher',
    imports: [NgOptimizedImage, DurstloescherModalComponent, ImageUrlPipe],
    templateUrl: './durstloescher.component.html',
    styleUrls: ['./durstloescher.component.css']
})
export default class DurstloescherComponent implements OnInit {
  durstloescher: Durstloescher[] = [];
  originalDurstloescher: Durstloescher[] = [];
  selectedDurstloescher: Durstloescher | null = null;

  constructor(
    private http: HttpClient,
    private ratingHydration: RatingHydrationService
  ) {}

  ngOnInit(): void {
    this.loadDurstloescher();
  }

  loadDurstloescher(): void {
    this.http.get<{ durstloescher: Durstloescher[] }>('assets/data/durstloescher.json').subscribe({
      next: (data) => {
        this.ratingHydration.hydrateRatings(data.durstloescher).subscribe(hydrated => {
          this.originalDurstloescher = hydrated as Durstloescher[];
          this.sortDurstloescher('post');
        });
      },
      error: (err) => {
        console.error('Failed to load durstloescher:', err);
      },
    });
  }

  showDescription(durstloescher: Durstloescher): void {
    setTimeout(() => {
      this.selectedDurstloescher = durstloescher;
    }, 0);
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

  protected readonly close = close;
}
