import {Component, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";

interface Stitch {
    filename: string;
    comment: string;
    rating: number[];
    id: string;
}

@Component({
  selector: 'app-stitch',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RatingBarComponent],
  templateUrl: './stitch.component.html',
  styleUrls: ['./stitch.component.css']
})
export default class StitchComponent implements OnInit {
  stitches: Stitch[] = [];

  constructor(private http: HttpClient, private ratingService: RatingService) {}

  ngOnInit(): void {
    this.loadStitches();
  }

  loadStitches(): void {
    this.http.get<{ stitches: Stitch[] }>('assets/misc/stitch/stitches.json').subscribe({
      next: (data) => {
        this.stitches = data.stitches;
        this.getRatings();
      },
      error: (err) => {
        console.error('Failed to load stitches:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.stitches.map(stitch => stitch.id))
      .subscribe(stitchRatings => {
        this.stitches = this.stitches.map(stitch => {
          const ratingData = stitchRatings.find(rating => rating.id === stitch.id);
          if (ratingData) {
            stitch.rating = ratingData.ratings;
          } else {
            stitch.rating = [0,0,0,0,0];
          }
          return stitch;
        });
      });
  }
}
