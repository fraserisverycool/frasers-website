import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Soundtrack} from "./soundtrack.interface";
import {SoundtrackModalComponent} from "./soundtrack-modal/soundtrack-modal.component";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {ImageService} from "../../utils/services/image.service";

const platformOrder = [
  "NES",
  "Gameboy",
  "SNES",
  "N64",
  "GBA",
  "Gamecube",
  "DS",
  "Wii",
  "3DS",
  "Wii U",
  "Switch"
];

@Component({
    selector: 'app-nintendo',
    imports: [CommonModule, RouterLink, FormsModule, NgOptimizedImage, SoundtrackModalComponent],
    templateUrl: './soundtracks.component.html',
    styleUrls: ['./soundtracks.component.css']
})
export default class SoundtracksComponent implements OnInit, AfterViewInit, OnDestroy {
  soundtracks: Soundtrack[] = [];
  originalSoundtracks: Soundtrack[] = [];
  selectedSoundtrack: Soundtrack | null = null;

  private _searchTerm: string = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.resetInfiniteScroll();
  }

  platformRank: Record<string, number> = platformOrder.reduce((acc, platform, index) => {
    acc[platform] = index;
    return acc;
  }, {} as Record<string, number>);

  pageSize = 10;
  itemsToShow = 10;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadSoundtracks();
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
    if (this.itemsToShow < this.filteredSoundtracks.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow = this.pageSize;
  }

  loadSoundtracks(): void {
    this.http.get<{ soundtracks: Soundtrack[] }>('assets/data/soundtracks.json').subscribe({
      next: (data) => {
        this.originalSoundtracks = data.soundtracks;
        this.getRatings();
        this.sortSoundtracks('release');
      },
      error: (err) => {
        console.error('Failed to load soundtracks:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.originalSoundtracks.map(soundtrack => soundtrack.id))
      .subscribe(soundtrackRatings => {
        this.originalSoundtracks = this.originalSoundtracks.map(soundtrack => {
          const ratingData = soundtrackRatings.find(rating => rating.id === soundtrack.id);
          if (ratingData) {
            soundtrack.rating = ratingData.ratings;
          } else {
            soundtrack.rating = [0,0,0,0,0,0];
          }
          return soundtrack;
        });
      });
  }

  get filteredSoundtracks(): Soundtrack[] {
    if (!this.searchTerm) {
      return this.soundtracks;
    }
    return this.soundtracks.filter(soundtrack => {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      return soundtrack.name.toLowerCase().includes(lowerCaseSearchTerm);
    });
  }

  showDescription(soundtrack: Soundtrack): void {
    setTimeout(() => {
      this.selectedSoundtrack = soundtrack;
    }, 0);
  }

  closeDescription(): void {
    this.selectedSoundtrack = null;
  }

  sortSoundtracks(criteria: 'random' | 'release' | 'alphabeticalName' | 'platform'): void {
    this.resetInfiniteScroll();
    switch (criteria) {
      case 'release':
        this.soundtracks = this.originalSoundtracks;
        break;
      case 'random':
        this.soundtracks = [...this.originalSoundtracks].sort(() => Math.random() - 0.5);
        break;
      case 'alphabeticalName':
        this.soundtracks = [...this.originalSoundtracks].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'platform':
        this.soundtracks = [...this.originalSoundtracks].sort((a, b) => {
          const rankA = this.platformRank[a.platform] ?? Number.MAX_SAFE_INTEGER;
          const rankB = this.platformRank[b.platform] ?? Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        });
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
