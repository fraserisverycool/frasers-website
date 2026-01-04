import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';

import { HttpClient } from "@angular/common/http";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {ImageService} from "../../utils/services/image.service";

interface Mp3Info {
  filename: string;
  name: string;
  description: string;
  rating: number[];
  id: string;
  newsletter: boolean;
}

@Component({
    selector: 'app-mixes',
    imports: [RatingBarComponent],
    templateUrl: './mixes.component.html',
    styleUrls: ['./mixes.component.css']
})
export default class MixesComponent implements OnInit, AfterViewInit, OnDestroy {
  mp3Files: Mp3Info[] = [];
  color: String = "#000000"

  pageSize = 5;
  itemsToShow = 5;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadMixes();
    this.color = this.getRandomColor();
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
    if (this.itemsToShow < this.mp3Files.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  loadMixes(): void {
    this.http.get<{ mixes: Mp3Info[] }>('assets/data/mixes.json').subscribe({
      next: (data) => {
        this.mp3Files = data.mixes;
        this.getRatings();
      },
      error: (err) => {
        console.error('Failed to load mixes:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.mp3Files.map(mp3File => mp3File.id))
      .subscribe(mp3FileRatings => {
        this.mp3Files = this.mp3Files.map(mp3File => {
          const ratingData = mp3FileRatings.find(rating => rating.id === mp3File.id);
          if (ratingData) {
            mp3File.rating = ratingData.ratings;
          } else {
            mp3File.rating = [0,0,0,0,0,0];
          }
          return mp3File;
        });
      });
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
