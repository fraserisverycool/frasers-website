import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NintendoPlaylist } from './nintendo-playlist.interface';
import { RatingBarComponent } from '../../../utils/rating-bar/rating-bar.component';
import { MusicService } from '../../service/music.service';
import { ImageUrlPipe } from '../../../utils/pipes/image-url.pipe';

@Component({
  selector: 'app-nintendo-playlists',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgOptimizedImage, RatingBarComponent, ImageUrlPipe],
  templateUrl: './nintendo-playlists.component.html',
  styleUrls: ['./nintendo-playlists.component.css']
})
export default class NintendoPlaylistsComponent implements OnInit {
  playlists: NintendoPlaylist[] = [];
  originalPlaylists: NintendoPlaylist[] = [];
  searchTerm: string = '';
  currentSort: 'default' | 'alphabetical' | 'random' = 'default';

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.musicService.getNintendoPlaylists().subscribe({
      next: (playlists) => {
        this.originalPlaylists = playlists;
        this.applySort();
      },
      error: (err) => {
        console.error('Failed to load nintendo playlists:', err);
      }
    });
  }

  get filteredPlaylists(): NintendoPlaylist[] {
    if (!this.searchTerm.trim()) {
      return this.playlists;
    }
    const term = this.searchTerm.toLowerCase();
    return this.playlists.filter(playlist =>
      playlist.name.toLowerCase().includes(term) ||
      playlist.description.toLowerCase().includes(term)
    );
  }

  sortPlaylists(criteria: 'default' | 'alphabetical' | 'random'): void {
    this.currentSort = criteria;
    this.applySort();
  }

  private applySort(): void {
    switch (this.currentSort) {
      case 'default':
        this.playlists = [...this.originalPlaylists];
        break;
      case 'alphabetical':
        this.playlists = [...this.originalPlaylists].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'random':
        this.playlists = [...this.originalPlaylists].sort(() => Math.random() - 0.5);
        break;
    }
  }
}
