import {Component, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {RatingHydrationService} from "../../utils/rating-bar/service/rating-hydration.service";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

interface Stitch {
  filename: string;
  comment: string;
  rating: number[];
  id: string;
  newsletter: boolean;
  timestamp?: string;
}

@Component({
    selector: 'app-stitch',
    imports: [CommonModule, NgOptimizedImage, RatingBarComponent, InfiniteScrollDirective, ImageUrlPipe],
    templateUrl: './stitch.component.html',
    styleUrls: ['./stitch.component.css']
})
export default class StitchComponent implements OnInit {
  stitches: Stitch[] = [];

  pageSize = 5;
  itemsToShow = 5;

  constructor(
    private http: HttpClient,
    private ratingHydration: RatingHydrationService
  ) {}

  ngOnInit(): void {
    this.loadStitches();
  }

  loadMore(): void {
    if (this.itemsToShow < this.stitches.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  loadStitches(): void {
    this.http.get<{ stitches: Stitch[] }>('assets/data/stitches.json').subscribe({
      next: (data) => {
        this.ratingHydration.hydrateRatings(data.stitches).subscribe(hydrated => {
          this.stitches = hydrated as Stitch[];
        });
      },
      error: (err) => {
        console.error('Failed to load stitches:', err);
      },
    });
  }
}
