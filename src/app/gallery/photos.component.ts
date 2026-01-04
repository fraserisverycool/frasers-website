import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';

import { HttpClient } from "@angular/common/http";
import {RouterLink} from "@angular/router";
import PhotoComponent from "./photo/photo.component";
import {Photo} from "./photo.interface";
import {RatingService} from "../utils/rating-bar/service/rating.service";

@Component({
    selector: 'app-gallery',
    imports: [RouterLink, PhotoComponent],
    templateUrl: './photos.component.html',
    styleUrls: ['./photos.component.css']
})
export default class PhotosComponent implements OnInit, AfterViewInit, OnDestroy {
  photos: Photo[] = [];
  pageSize = 5;
  itemsToShow = 5;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(private http: HttpClient, private ratingService: RatingService) {}

  ngOnInit(): void {
    this.http.get<{ pictures: Photo[] }>('assets/data/photos.json').subscribe({
      next: (data) => {
        this.photos = data.pictures;
        this.getRatings();
      },
      error: (err) => {
        console.error('Failed to load photos:', err);
      },
    });
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.loadMore();
      }
    }, {
      rootMargin: '100px'
    });

    if (this.scrollAnchor) {
      this.observer.observe(this.scrollAnchor.nativeElement);
    }
  }

  loadMore(): void {
    if (this.itemsToShow < this.photos.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.photos.map(photo => photo.id))
      .subscribe(photoRatings => {
        this.photos = this.photos.map(photo => {
          const ratingData = photoRatings.find(rating => rating.id === photo.id);
          if (ratingData) {
            photo.rating = ratingData.ratings;
          } else {
            photo.rating = [0,0,0,0,0,0];
          }
          return photo;
        });
      });
  }

}
