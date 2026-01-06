import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {ImageService} from "../../utils/services/image.service";

interface Stitch {
    filename: string;
    comment: string;
    rating: number[];
    id: string;
  newsletter: boolean;
}

@Component({
    selector: 'app-stitch',
    imports: [CommonModule, NgOptimizedImage, RatingBarComponent],
    templateUrl: './stitch.component.html',
    styleUrls: ['./stitch.component.css']
})
export default class StitchComponent implements OnInit, AfterViewInit, OnDestroy {
  stitches: Stitch[] = [];

  pageSize = 5;
  itemsToShow = 5;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadStitches();
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
    if (this.itemsToShow < this.stitches.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  loadStitches(): void {
    this.http.get<{ stitches: Stitch[] }>('assets/data/stitches.json').subscribe({
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
            stitch.rating = [0,0,0,0,0,0];
          }
          return stitch;
        });
      });
  }
}
