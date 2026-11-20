import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
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
    imports: [NgOptimizedImage, RatingBarComponent, InfiniteScrollDirective, ImageUrlPipe],
    templateUrl: './stitch.component.html',
    styleUrls: ['./stitch.component.css']
})
export default class StitchComponent {
  private http = inject(HttpClient);
  private ratingHydration = inject(RatingHydrationService);

  readonly stitches = toSignal(
    this.http.get<{ stitches: Stitch[] }>('assets/data/stitches.json').pipe(
      switchMap(data => this.ratingHydration.hydrateRatings(data.stitches)),
      catchError(err => {
        console.error('Failed to load stitches:', err);
        return of([] as Stitch[]);
      })
    ),
    { initialValue: [] as Stitch[] }
  );

  private readonly pageSize = 5;
  readonly itemsToShow = signal(this.pageSize);
  readonly visibleStitches = computed(() => this.stitches().slice(0, this.itemsToShow()));

  loadMore(): void {
    if (this.itemsToShow() < this.stitches().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }
}
