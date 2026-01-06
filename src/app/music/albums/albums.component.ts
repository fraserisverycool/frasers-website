import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import {FormsModule} from '@angular/forms';
import {Album} from "./album.interface";
import {AlbumModalComponent} from "./album-modal/album-modal.component";
import {AlbumsService} from "./service/albums.service";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-albums',
    imports: [FormsModule, NgOptimizedImage, AlbumModalComponent],
    templateUrl: './albums.component.html',
    styleUrls: ['./albums.component.css']
})
export default class AlbumsComponent implements OnInit, AfterViewInit, OnDestroy {
  albums: Album[] = [];
  originalAlbums: Album[] = [];
  selectedAlbum: Album | null = null;

  private _searchTerm: string = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.resetInfiniteScroll();
  }

  selectedTags: string[] = [];

  availableTags: string[] = [
    'chill', 'electronic', 'pop', 'party',
    'scandinavian', 'rock', 'folky', 'indie',
    'brazilian', 'peaceful', 'soul', 'hip-hop', 'singer-songwriter',
    'concrete themes', 'magical', 'from the heart',
    'special vibes', 'classic', 'not for everyone', 'cunty', 'devastating', 'wild shit', 'all time faves'
  ];

  pageSize = 10;
  itemsToShow = 10;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(private http: HttpClient, private albumsService: AlbumsService, private ratingService: RatingService, protected imageService: ImageService,) {}

  ngOnInit(): void {
    this.loadAlbums();
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
    if (this.itemsToShow < this.filteredAlbums.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow = this.pageSize;
  }

  loadAlbums(): void {
    this.http.get<{ albums: Album[] }>('assets/data/albums.json').subscribe({
      next: (data) => {
        this.originalAlbums = data.albums;
        this.getRatings();
        this.sortAlbums('random');
        this.generateColours();
      },
      error: (err) => {
        console.error('Failed to load albums:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.originalAlbums.map(album => album.id))
      .subscribe(albumRatings => {
        this.originalAlbums = this.originalAlbums.map(album => {
          const ratingData = albumRatings.find(rating => rating.id === album.id);
          if (ratingData) {
            album.rating = ratingData.ratings;
          } else {
            album.rating = [0,0,0,0,0,0];
          }
          return album;
        });
      });
  }

  get filteredAlbums(): Album[] {
    let filtered = this.albums;

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(album =>
        album.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        album.artist.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(album =>
        this.selectedTags.every(tag => album.tags.includes(tag))
      );
    }

    return filtered;
  }

  showDescription(album: Album): void {
    setTimeout(() => {
      this.selectedAlbum = album;
    }, 0);
  }

  closeDescription(): void {
    this.selectedAlbum = null;
  }

  sortAlbums(criteria: 'random' | 'alphabeticalName' | 'alphabeticalArtist' | 'releaseDate'): void {
    this.resetInfiniteScroll();
    switch (criteria) {
      case 'random':
        this.albums = [...this.originalAlbums].sort(() => Math.random() - 0.5);
        break;
      case 'alphabeticalName':
        this.albums = [...this.originalAlbums].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alphabeticalArtist':
        this.albums = [...this.originalAlbums].sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'releaseDate':
        this.albums = [...this.originalAlbums].sort((a, b) => parseInt(a.releaseyear) - parseInt(b.releaseyear));
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }

  toggleTagSelection(tag: string): void {
    this.resetInfiniteScroll();
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
  }

  generateColours(): void {
    this.albums.forEach(album => {
      album.color = this.albumsService.generateRainbowColor(album.releaseyear);
      album.textColor = this.albumsService.generateTextColor(album.releaseyear);
    });
  }
}
