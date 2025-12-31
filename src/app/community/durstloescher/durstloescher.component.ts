import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import StarMessageComponent from "../../utils/star-message/star-message.component";
import {ClickedOutsideDirective} from "../../utils/directives/clicked-outside.directive";
import {Durstloescher} from "./durstloescher.interface";
import {DurstloescherModalComponent} from "./durstloescher-model/durstloescher-modal.component";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-durstloescher',
    imports: [CommonModule, NgOptimizedImage, StarMessageComponent, ClickedOutsideDirective, DurstloescherModalComponent],
    templateUrl: './durstloescher.component.html',
    styleUrls: ['./durstloescher.component.css']
})
export default class DurstloescherComponent implements OnInit {
  durstloescher: Durstloescher[] = [];
  originalDurstloescher: Durstloescher[] = [];
  selectedDurstloescher: Durstloescher | null = null;

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadDurstloescher();
  }

  loadDurstloescher(): void {
    this.http.get<{ durstloescher: Durstloescher[] }>('assets/data/durstloescher.json').subscribe({
      next: (data) => {
        this.originalDurstloescher = data.durstloescher;
        this.getRatings();
        this.sortDurstloescher('post');
      },
      error: (err) => {
        console.error('Failed to load durstloescher:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.originalDurstloescher.map(durstloescher => durstloescher.id))
      .subscribe(durstloescherRatings => {
        this.originalDurstloescher = this.originalDurstloescher.map(durstloescher => {
          const ratingData = durstloescherRatings.find(rating => rating.id === durstloescher.id);
          if (ratingData) {
            durstloescher.rating = ratingData.ratings;
          } else {
            durstloescher.rating = [0,0,0,0,0,0];
          }
          return durstloescher;
        });
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
