import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {RouterLink} from "@angular/router";
import PhotoComponent from "./photo/photo.component";
import {Photo} from "./photo.interface";
import {RatingService} from "../utils/rating-bar/service/rating.service";

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, PhotoComponent],
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export default class PhotosComponent implements OnInit {
  photos: Photo[] = [];

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
