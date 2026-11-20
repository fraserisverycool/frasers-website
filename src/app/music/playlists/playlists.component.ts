import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {Playlist} from "./playlist.interface";
import {MusicService} from "../service/music.service";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-playlists',
  imports: [RatingBarComponent, InfiniteScrollDirective, ImageUrlPipe],
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.css']
})
export default class PlaylistsComponent implements OnInit {
  private musicService = inject(MusicService);

  readonly mp3Files = signal<Playlist[]>([]);
  readonly color = signal(this.getRandomColor());

  private readonly pageSize = 5;
  readonly itemsToShow = signal(this.pageSize);
  readonly visibleFiles = computed(() => this.mp3Files().slice(0, this.itemsToShow()));

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadMore(): void {
    if (this.itemsToShow() < this.mp3Files().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  loadPlaylists(): void {
    this.musicService.getPlaylists().subscribe({
      next: (playlists) => this.mp3Files.set(playlists),
      error: (err) => {
        console.error('Failed to load playlists:', err);
      },
    });
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
