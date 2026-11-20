import {Component, OnInit} from '@angular/core';
import {Playlist} from "./playlist.interface";
import {MusicService} from "../service/music.service";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-playlists',
  imports: [RatingBarComponent, InfiniteScrollDirective, ImageUrlPipe],
  templateUrl: './playlists.component.html',
  standalone: true,
  styleUrls: ['./playlists.component.css']
})
export default class PlaylistsComponent implements OnInit {
  mp3Files: Playlist[] = [];
  color: String = "#000000"

  pageSize = 5;
  itemsToShow = 5;

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadPlaylists();
    this.color = this.getRandomColor();
  }

  loadMore(): void {
    if (this.itemsToShow < this.mp3Files.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  loadPlaylists(): void {
    this.musicService.getPlaylists().subscribe({
      next: (playlists) => {
        this.mp3Files = playlists;
      },
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
