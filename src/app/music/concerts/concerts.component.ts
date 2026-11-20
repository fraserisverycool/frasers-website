import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { catchError, map, of } from 'rxjs';
import {Concert} from "./concert.interface";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {MusicService} from "../service/music.service";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-concerts',
  imports: [NgOptimizedImage, RatingBarComponent, InfiniteScrollDirective, ImageUrlPipe],
  templateUrl: './concerts.component.html',
  styleUrls: ['./concerts.component.css']
})
export default class ConcertsComponent {
  private musicService = inject(MusicService);

  readonly concerts = toSignal(
    this.musicService.getConcerts().pipe(
      map(concerts => concerts.filter(concert => concert.artist !== '')),
      catchError(err => {
        console.error('Failed to load concerts:', err);
        return of([] as Concert[]);
      })
    ),
    { initialValue: [] as Concert[] }
  );

  private readonly pageSize = 5;
  readonly itemsToShow = signal(this.pageSize);
  readonly visibleConcerts = computed(() => this.concerts().slice(0, this.itemsToShow()));

  loadMore(): void {
    if (this.itemsToShow() < this.concerts().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }
}
