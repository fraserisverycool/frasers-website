import {Component, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CD} from "./cd.interface";
import {CdModalComponent} from "./cd-modal/cd-modal.component";
import {MusicService} from "../service/music.service";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-cds',
  imports: [CommonModule, FormsModule, NgOptimizedImage, CdModalComponent, InfiniteScrollDirective, ImageUrlPipe],
  templateUrl: './cds.component.html',
  standalone: true,
  styleUrls: ['./cds.component.css']
})
export default class CdsComponent implements OnInit {
  cds: CD[] = [];
  originalCds: CD[] = [];
  selectedCd: CD | null = null;

  private _searchTerm: string = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.resetInfiniteScroll();
  }

  genres = new Map<string, string>();
  genreList = ["Art Pop", "Pop", "Rock & Electronic", "House & Disco", "Indie & Singer-Songwriter", "Jazz, Soul & Hip-Hop", "Vocal Jazz & Smooth", "Video Game OST", "Classical"];
  selectedTag: string | null = null;

  pageSize = 20;
  itemsToShow = 20;

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadGenres();
    this.loadCds();
  }

  loadMore(): void {
    if (this.itemsToShow < this.filteredCds.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow = this.pageSize;
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
    this.musicService.getCds().subscribe({
      next: (cds) => {
        this.originalCds = cds;
        this.sortCds('genre');
      },
      error: (err) => {
        console.error('Failed to load CDs:', err);
      },
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
    this.resetInfiniteScroll();
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
    this.resetInfiniteScroll();
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
