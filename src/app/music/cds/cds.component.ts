import {Component, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import {FormsModule} from '@angular/forms';
import {CD} from "./cd.interface";
import {CdModalComponent} from "./cd-modal/cd-modal.component";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-cds',
    imports: [CommonModule, FormsModule, NgOptimizedImage, CdModalComponent],
    templateUrl: './cds.component.html',
    styleUrls: ['./cds.component.css']
})
export default class CdsComponent implements OnInit {
  cds: CD[] = [];
  originalCds: CD[] = [];
  selectedCd: CD | null = null;
  searchTerm: string = '';
  genres = new Map<string, string>();
  genreList = ["Art Pop", "Pop", "Rock & Electronic", "House & Disco", "Indie & Singer-Songwriter", "Jazz, Soul & Hip-Hop", "Vocal Jazz & Smooth", "Video Game OST", "Classical"];
  selectedTag: string | null = null;

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadGenres();
    this.loadCds();
  }

  loadGenres(): void {
    let genres = new Map<string, string>();
    genres.set("Art Pop","#f563ff");
    genres.set("Pop", "#ff3721");
    genres.set("Rock & Electronic", "#ff7300");
    genres.set("House & Disco", "#ffe224");
    genres.set("Indie & Singer-Songwriter", "#22851b");
    genres.set("Jazz, Soul & Hip-Hop", "#618bff");
    genres.set("Vocal Jazz & Smooth", "#9642d6");
    genres.set("Video Game OST", "white");
    genres.set("Classical", "#7a3d1a");
    this.genres = genres;
  }

  loadCds(): void {
    this.http.get<{ cds: CD[] }>('assets/data/cds.json').subscribe({
      next: (data) => {
        this.originalCds = data.cds;
        this.getRatings();
        this.sortCds('genre');
      },
      error: (err) => {
        console.error('Failed to load CDs:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.originalCds.map(cd => cd.id))
      .subscribe(cdRatings => {
        this.originalCds = this.originalCds.map(cd => {
          const ratingData = cdRatings.find(rating => rating.id === cd.id);
          if (ratingData) {
            cd.rating = ratingData.ratings;
          } else {
            cd.rating = [0,0,0,0,0,0];
          }
          return cd;
        });
      });
  }

  get filteredCds(): CD[] {
    let filtered = this.cds;

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cd =>
        cd.artist.toLowerCase().includes(lowerCaseSearchTerm) ||
        cd.album.toString().toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (this.selectedTag) {
      filtered = filtered.filter(cd => cd.genre === this.selectedTag);
    }

    return filtered;
  }

  toggleTagSelection(tag: string): void {
    this.selectedTag = tag;
  }

  showDescription(cd: CD): void {
    setTimeout(() => {
      this.selectedCd = cd;
    }, 0);
  }

  closeDescription(): void {
    this.selectedCd = null;
  }

  sortCds(criteria: 'random' | 'alphabeticalAlbum' | 'alphabeticalArtist' | 'genre'): void {
    switch (criteria) {
      case 'random':
        this.cds = [...this.originalCds].sort(() => Math.random() - 0.5);
        break;
      case 'alphabeticalAlbum':
        this.cds = [...this.originalCds].sort((a, b) => a.album.toString().localeCompare(b.album));
        break;
      case 'alphabeticalArtist':
        this.cds = [...this.originalCds].sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'genre':
        const genreOrder = Array.from(this.genres.keys());
        this.cds = [...this.originalCds].sort((a, b) => {
          const indexA = genreOrder.indexOf(a.genre);
          const indexB = genreOrder.indexOf(b.genre);

          if (indexA === -1) return 1;
          if (indexB === -1) return -1;

          return indexA - indexB;
        });
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }

  generateGenreColour(genre: string) {
    return this.genres.get(genre);
  }
}
