import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NintendoPlaylist } from './nintendo-playlist.interface';
import { RatingBarComponent } from '../../../utils/rating-bar/rating-bar.component';
import { RatingService } from '../../../utils/rating-bar/service/rating.service';
import { ImageService } from '../../../utils/services/image.service';

@Component({
  selector: 'app-nintendo-playlists',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgOptimizedImage, RatingBarComponent],
  templateUrl: './nintendo-playlists.component.html',
  styleUrls: ['./nintendo-playlists.component.css']
})
export default class NintendoPlaylistsComponent implements OnInit {
  playlists: NintendoPlaylist[] = [];
  originalPlaylists: NintendoPlaylist[] = [];
  searchTerm: string = '';
  currentSort: 'default' | 'alphabetical' | 'random' = 'default';

  constructor(
    private http: HttpClient,
    private ratingService: RatingService,
    protected imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.http.get<{ playlists: NintendoPlaylist[] }>('assets/data/nintendo-playlists.json').subscribe({
      next: (data) => {
        this.originalPlaylists = data.playlists.map(p => ({
          ...p,
          rating: p.rating ?? [0, 0, 0, 0, 0, 0]
        }));
        this.playlists = [...this.originalPlaylists];
        this.getRatings();
      },
      error: (err) => {
        console.error('Failed to load nintendo playlists:', err);
      }
    });
  }

  getRatings(): void {
    const ids = this.originalPlaylists.map(p => p.id);
    this.ratingService.getRatingsById(ids).subscribe(ratings => {
      this.originalPlaylists = this.originalPlaylists.map(playlist => {
        const ratingData = ratings.find(r => r.id === playlist.id);
        playlist.rating = ratingData ? ratingData.ratings : [0, 0, 0, 0, 0, 0];
        return playlist;
      });
      this.applySort();
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

  getPlaylistImageUrl(image: string): string {
    return this.imageService.imageUrl('/music/nintendo-playlists/' + image);
  }
}
