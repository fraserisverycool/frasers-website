import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {FormsModule} from '@angular/forms';
import {ClickedOutsideDirective} from "../../utils/directives/clicked-outside.directive";
import {Album} from "./album.interface";
import {DurstloescherModalComponent} from "../../community/durstloescher/durstloescher-model/durstloescher-modal.component";
import {AlbumModalComponent} from "./album-modal/album-modal.component";
import {AlbumsService} from "./albums.service";

@Component({
  selector: 'app-albums',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage, ClickedOutsideDirective, DurstloescherModalComponent, AlbumModalComponent],
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})
export default class AlbumsComponent implements OnInit {
  albums: Album[] = [];
  originalAlbums: Album[] = [];
  selectedAlbum: Album | null = null;

  searchTerm: string = '';
  selectedTags: string[] = [];

  availableTags: string[] = [
    'chill', 'electronic', 'pop', 'party',
    'scandinavian', 'rock', 'folky', 'indie',
    'brazilian', 'peaceful', 'soul', 'hip-hop', 'singer-songwriter',
    'concrete themes', 'magical', 'from the heart',
    'special vibes', 'classic', 'not for everyone', 'cunty', 'devastating', 'wild shit', 'all time faves'
  ];

  constructor(private http: HttpClient, private albumsService: AlbumsService) {}

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadAlbums(): void {
    this.http.get<{ albums: Album[] }>('assets/music/albums/albums.json').subscribe({
      next: (data) => {
        this.originalAlbums = data.albums;
        this.sortAlbums('random');
        this.generateColours();
      },
      error: (err) => {
        console.error('Failed to load albums:', err);
      },
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
