import {Component, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {Concert} from "./concert.interface";
import { HttpClient } from "@angular/common/http";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-concerts',
    imports: [CommonModule, NgOptimizedImage, RatingBarComponent],
    templateUrl: './concerts.component.html',
    styleUrls: ['./concerts.component.css']
})
export default class ConcertsComponent implements OnInit {
  concerts: Concert[] = []

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService) {}

  ngOnInit(): void {
      this.loadConcerts();
  }

  loadConcerts(): void {
    this.http.get<{ concerts: Concert[] }>('assets/data/concerts.json').subscribe({
      next: (data) => {
        this.concerts = data.concerts.filter(concert => concert.artist !== '');
        this.getRatings();
      },
      error: (err) => {
        console.error('Failed to load stitches:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.concerts.map(concert => concert.id))
      .subscribe(concertRatings => {
        this.concerts = this.concerts.map(concert => {
          const ratingData = concertRatings.find(rating => rating.id === concert.id);
          if (ratingData) {
            concert.rating = ratingData.ratings;
          } else {
            concert.rating = [0,0,0,0,0,0];
          }
          return concert;
        });
      });
  }
}
