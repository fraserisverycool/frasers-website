import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NintendoPlaylist } from './nintendo-playlist.interface';
import { RatingBarComponent } from '../../../utils/rating-bar/rating-bar.component';
import { MusicService } from '../../service/music.service';
import { ImageUrlPipe } from '../../../utils/pipes/image-url.pipe';

type PlaylistSort = 'default' | 'alphabetical' | 'random';

@Component({
  selector: 'app-nintendo-playlists',
  imports: [RouterLink, FormsModule, NgOptimizedImage, RatingBarComponent, ImageUrlPipe],
  templateUrl: './nintendo-playlists.component.html',
  styleUrls: ['./nintendo-playlists.component.css']
})
export default class NintendoPlaylistsComponent implements OnInit {
  private musicService = inject(MusicService);

  readonly originalPlaylists = signal<NintendoPlaylist[]>([]);
  readonly playlists = signal<NintendoPlaylist[]>([]);
  readonly searchTerm = signal('');
  readonly currentSort = signal<PlaylistSort>('default');

  readonly filteredPlaylists = computed(() => {
    const searchTerm = this.searchTerm();
    if (!searchTerm.trim()) {
      return this.playlists();
    }
    const term = searchTerm.toLowerCase();
    return this.playlists().filter(playlist =>
      playlist.name.toLowerCase().includes(term) ||
      playlist.description.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.musicService.getNintendoPlaylists().subscribe({
      next: (playlists) => {
        this.originalPlaylists.set(playlists);
        this.applySort();
      },
      error: (err) => {
        console.error('Failed to load nintendo playlists:', err);
      }
    });
  }

  sortPlaylists(criteria: PlaylistSort): void {
    this.currentSort.set(criteria);
    this.applySort();
  }

  private applySort(): void {
    const original = this.originalPlaylists();
    switch (this.currentSort()) {
      case 'default':
        this.playlists.set([...original]);
        break;
      case 'alphabetical':
        this.playlists.set([...original].sort((a, b) => a.name.localeCompare(b.name)));
        break;
      case 'random':
        this.playlists.set([...original].sort(() => Math.random() - 0.5));
        break;
    }
  }
}
