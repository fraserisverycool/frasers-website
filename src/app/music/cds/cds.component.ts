import { Component, OnInit, computed, inject, linkedSignal, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CD} from "./cd.interface";
import {CdModalComponent} from "./cd-modal/cd-modal.component";
import {MusicService} from "../service/music.service";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-cds',
  imports: [FormsModule, NgOptimizedImage, CdModalComponent, InfiniteScrollDirective, ImageUrlPipe],
  templateUrl: './cds.component.html',
  styleUrls: ['./cds.component.css']
})
export default class CdsComponent implements OnInit {
  private musicService = inject(MusicService);

  private readonly originalCds = signal<CD[]>([]);
  readonly cds = signal<CD[]>([]);
  readonly selectedCd = signal<CD | null>(null);
  readonly searchTerm = signal('');
  readonly selectedTag = signal<string | null>(null);

  readonly genres = new Map<string, string>([
    ["Art Pop", "#f563ff"],
    ["Pop", "#ff3721"],
    ["Rock & Electronic", "#ff7300"],
    ["House & Disco", "#ffe224"],
    ["Indie & Singer-Songwriter", "#22851b"],
    ["Jazz, Soul & Hip-Hop", "#618bff"],
    ["Vocal Jazz & Smooth", "#9642d6"],
    ["Video Game OST", "white"],
    ["Classical", "#7a3d1a"],
  ]);
  readonly genreList = ["Art Pop", "Pop", "Rock & Electronic", "House & Disco", "Indie & Singer-Songwriter", "Jazz, Soul & Hip-Hop", "Vocal Jazz & Smooth", "Video Game OST", "Classical"];

  readonly filteredCds = computed(() => {
    let filtered = this.cds();
    const searchTerm = this.searchTerm();
    const selectedTag = this.selectedTag();

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(cd =>
        cd.artist.toLowerCase().includes(lowerCaseSearchTerm) ||
        cd.album.toString().toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(cd => cd.genre === selectedTag);
    }

    return filtered;
  });

  private readonly pageSize = 20;
  /** Resets to one page whenever the filtered list changes (search, genre, sort, load). */
  readonly itemsToShow = linkedSignal({ source: this.filteredCds, computation: () => this.pageSize });
  readonly visibleCds = computed(() => this.filteredCds().slice(0, this.itemsToShow()));

  ngOnInit(): void {
    this.loadCds();
  }

  loadMore(): void {
    if (this.itemsToShow() < this.filteredCds().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  loadCds(): void {
    this.musicService.getCds().subscribe({
      next: (cds) => {
        this.originalCds.set(cds);
        this.sortCds('genre');
      },
      error: (err) => {
        console.error('Failed to load CDs:', err);
      },
    });
  }

  toggleTagSelection(tag: string): void {
    this.selectedTag.set(tag);
  }

  showDescription(cd: CD): void {
    // Deferred so the opening click isn't treated as a click outside the modal.
    setTimeout(() => {
      this.selectedCd.set(cd);
    }, 0);
  }

  closeDescription(): void {
    this.selectedCd.set(null);
  }

  sortCds(criteria: 'random' | 'alphabeticalAlbum' | 'alphabeticalArtist' | 'genre'): void {
    const original = this.originalCds();
    switch (criteria) {
      case 'random':
        this.cds.set([...original].sort(() => Math.random() - 0.5));
        break;
      case 'alphabeticalAlbum':
        this.cds.set([...original].sort((a, b) => a.album.toString().localeCompare(b.album)));
        break;
      case 'alphabeticalArtist':
        this.cds.set([...original].sort((a, b) => a.artist.localeCompare(b.artist)));
        break;
      case 'genre': {
        const genreOrder = Array.from(this.genres.keys());
        this.cds.set([...original].sort((a, b) => {
          const indexA = genreOrder.indexOf(a.genre);
          const indexB = genreOrder.indexOf(b.genre);

          if (indexA === -1) return 1;
          if (indexB === -1) return -1;

          return indexA - indexB;
        }));
        break;
      }
      default:
        console.error('Invalid sorting criteria');
    }
  }

  generateGenreColour(genre: string) {
    return this.genres.get(genre);
  }
}
