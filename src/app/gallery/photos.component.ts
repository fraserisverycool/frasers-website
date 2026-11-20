import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import {RouterLink} from "@angular/router";
import PhotoComponent from "./photo/photo.component";
import {Photo} from "./photo.interface";
import {PhotoService} from "./photo/service/photo.service";
import {InfiniteScrollDirective} from "../utils/directives/infinite-scroll.directive";

@Component({
    selector: 'app-gallery',
    imports: [RouterLink, PhotoComponent, InfiniteScrollDirective],
    templateUrl: './photos.component.html',
    styleUrls: ['./photos.component.css']
})
export default class PhotosComponent {
  private photoService = inject(PhotoService);

  readonly photos = toSignal(
    this.photoService.getPhotos().pipe(
      catchError(err => {
        console.error('Failed to load photos:', err);
        return of([] as Photo[]);
      })
    ),
    { initialValue: [] as Photo[] }
  );

  private readonly pageSize = 5;
  readonly itemsToShow = signal(this.pageSize);
  readonly visiblePhotos = computed(() => this.photos().slice(0, this.itemsToShow()));

  loadMore(): void {
    if (this.itemsToShow() < this.photos().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }
}
