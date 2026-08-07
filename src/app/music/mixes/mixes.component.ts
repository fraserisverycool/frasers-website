import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone} from '@angular/core';

import { HttpClient } from "@angular/common/http";
import {FormsModule} from '@angular/forms';
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {ImageService} from "../../utils/services/image.service";
import {MixModalComponent} from "./mix-modal/mix-modal.component";

interface Mp3Info {
  filename: string;
  name: string;
  description: string;
  image: string;
  rating: number[];
  id: string;
  newsletter: boolean;
}

@Component({
    selector: 'app-mixes',
    imports: [RatingBarComponent, MixModalComponent, FormsModule],
    templateUrl: './mixes.component.html',
    standalone: true,
    styleUrls: ['./mixes.component.css']
})
export default class MixesComponent implements OnInit, AfterViewInit, OnDestroy {
  mp3Files: Mp3Info[] = [];
  originalMixes: Mp3Info[] = [];
  filteredMixes: Mp3Info[] = [];
  color: string = "#000000"

  private _searchTerm: string = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.applyFilters();
  }

  pageSize = 20;
  itemsToShow = 20;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  selectedMix: Mp3Info | null = null;

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService, private ngZone: NgZone) {}

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
        this.ngZone.run(() => {
          this.loadMore();
        });
      }
    }, {
      rootMargin: '300px'
    });

    if (this.scrollAnchor) {
      this.observer.observe(this.scrollAnchor.nativeElement);
    }
  }

  loadMore(): void {
    if (this.itemsToShow < this.filteredMixes.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow = this.pageSize;
  }

  showMix(mix: Mp3Info): void {
    setTimeout(() => {
      this.selectedMix = mix;
    }, 0);
  }

  closeMix(): void {
    this.selectedMix = null;
  }

  loadMixes(): void {
    this.http.get<{ mixes: Mp3Info[] }>('assets/data/mixes.json').subscribe({
      next: (data) => {
        this.originalMixes = data.mixes;
        this.mp3Files = data.mixes;
        this.getRatings();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load mixes:', err);
      },
    });
  }

  applyFilters(): void {
    this.resetInfiniteScroll();
    let filtered = [...this.mp3Files];

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(mix =>
        mix.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.filteredMixes = filtered;
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
