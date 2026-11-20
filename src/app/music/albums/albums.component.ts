import { Component, OnInit, computed, inject, linkedSignal, signal } from '@angular/core';
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
  styleUrls: ['./albums.component.css']
})
export default class AlbumsComponent implements OnInit {
  private albumsService = inject(AlbumsService);
  private musicService = inject(MusicService);

  private readonly originalAlbums = signal<Album[]>([]);
  readonly albums = signal<Album[]>([]);
  readonly selectedAlbum = signal<Album | null>(null);
  readonly searchTerm = signal('');
  readonly selectedTags = signal<string[]>([]);

  readonly availableTags: string[] = [
    'chill', 'electronic', 'pop', 'party',
    'scandinavian', 'rock', 'folky', 'indie',
    'brazilian', 'peaceful', 'soul', 'hip-hop', 'singer-songwriter',
    'concrete themes', 'magical', 'from the heart',
    'special vibes', 'classic', 'not for everyone', 'cunty', 'devastating', 'wild shit', 'all time faves'
  ];

  readonly filteredAlbums = computed(() => {
    let filtered = this.albums();
    const searchTerm = this.searchTerm();
    const selectedTags = this.selectedTags();

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(album =>
        album.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        album.artist.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(album =>
        selectedTags.every(tag => album.tags.includes(tag))
      );
    }

    return filtered;
  });

  private readonly pageSize = 20;
  /** Resets to one page whenever the filtered list changes (search, tags, sort, load). */
  readonly itemsToShow = linkedSignal({ source: this.filteredAlbums, computation: () => this.pageSize });
  readonly visibleAlbums = computed(() => this.filteredAlbums().slice(0, this.itemsToShow()));

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadMore(): void {
    if (this.itemsToShow() < this.filteredAlbums().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  loadAlbums(): void {
    this.musicService.getAlbums().subscribe({
      next: (albums) => {
        this.originalAlbums.set(this.withColours(albums));
        this.sortAlbums('random');
      },
      error: (err) => {
        console.error('Failed to load albums:', err);
      },
    });
  }

  showDescription(album: Album): void {
    // Deferred so the opening click isn't treated as a click outside the modal.
    setTimeout(() => {
      this.selectedAlbum.set(album);
    }, 0);
  }

  closeDescription(): void {
    this.selectedAlbum.set(null);
  }

  sortAlbums(criteria: 'random' | 'alphabeticalName' | 'alphabeticalArtist' | 'releaseDate'): void {
    const original = this.originalAlbums();
    switch (criteria) {
      case 'random':
        this.albums.set([...original].sort(() => Math.random() - 0.5));
        break;
      case 'alphabeticalName':
        this.albums.set([...original].sort((a, b) => a.name.localeCompare(b.name)));
        break;
      case 'alphabeticalArtist':
        this.albums.set([...original].sort((a, b) => a.artist.localeCompare(b.artist)));
        break;
      case 'releaseDate':
        this.albums.set([...original].sort((a, b) => parseInt(a.releaseyear) - parseInt(b.releaseyear)));
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }

  toggleTagSelection(tag: string): void {
    this.selectedTags.update(tags =>
      tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    );
  }

  private withColours(albums: Album[]): Album[] {
    return albums.map(album => ({
      ...album,
      color: this.albumsService.generateRainbowColor(album.releaseyear),
      textColor: this.albumsService.generateTextColor(album.releaseyear),
    }));
  }
}
