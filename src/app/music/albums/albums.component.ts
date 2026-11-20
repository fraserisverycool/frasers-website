import {Component, OnInit} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Album} from "./album.interface";
import {AlbumModalComponent} from "./album-modal/album-modal.component";
import {AlbumsService} from "./service/albums.service";
import {MusicService} from "../service/music.service";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-albums',
  imports: [FormsModule, NgOptimizedImage, AlbumModalComponent, InfiniteScrollDirective, ImageUrlPipe],
  templateUrl: './albums.component.html',
  standalone: true,
  styleUrls: ['./albums.component.css']
})
export default class AlbumsComponent implements OnInit {
  albums: Album[] = [];
  originalAlbums: Album[] = [];
  filteredAlbums: Album[] = [];
  selectedAlbum: Album | null = null;

  private _searchTerm: string = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.applyFilters();
  }

  selectedTags: string[] = [];

  availableTags: string[] = [
    'chill', 'electronic', 'pop', 'party',
    'scandinavian', 'rock', 'folky', 'indie',
    'brazilian', 'peaceful', 'soul', 'hip-hop', 'singer-songwriter',
    'concrete themes', 'magical', 'from the heart',
    'special vibes', 'classic', 'not for everyone', 'cunty', 'devastating', 'wild shit', 'all time faves'
  ];

  pageSize = 20;
  itemsToShow = 20;

  constructor(private albumsService: AlbumsService, private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadAlbums();
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
    this.musicService.getAlbums().subscribe({
      next: (albums) => {
        this.originalAlbums = albums;
        this.sortAlbums('random');
        this.generateColours();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load albums:', err);
      },
    });
  }

  applyFilters(): void {
    this.resetInfiniteScroll();
    let filtered = [...this.albums];

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

    this.filteredAlbums = filtered;
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
    this.applyFilters();
  }

  toggleTagSelection(tag: string): void {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
    this.applyFilters();
  }

  generateColours(): void {
    this.albums.forEach(album => {
      album.color = this.albumsService.generateRainbowColor(album.releaseyear);
      album.textColor = this.albumsService.generateTextColor(album.releaseyear);
    });
  }
}
