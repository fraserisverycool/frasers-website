import {Component, OnInit} from '@angular/core';
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
export default class PhotosComponent implements OnInit {
  photos: Photo[] = [];
  pageSize = 5;
  itemsToShow = 5;

  constructor(private photoService: PhotoService) {}

  ngOnInit(): void {
    this.photoService.getPhotos().subscribe({
      next: (photos) => {
        this.photos = photos;
      },
      error: (err) => {
        console.error('Failed to load photos:', err);
      },
    });
  }

  loadMore(): void {
    if (this.itemsToShow < this.photos.length) {
      this.itemsToShow += this.pageSize;
    }
  }
}
