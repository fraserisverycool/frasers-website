import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { catchError, map, of } from 'rxjs';
import {KKSong} from "./kk-song.interface";
import {KkModalComponent} from "./kk-modal/kk-modal.component";
import {MusicService} from "../../service/music.service";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-kk',
  imports: [NgOptimizedImage, KkModalComponent, ImageUrlPipe],
  templateUrl: './kk.component.html',
  styleUrls: ['./kk.component.css']
})
export default class KkComponent {
  private musicService = inject(MusicService);

  readonly kkSongs = toSignal(
    this.musicService.getKkSongs().pipe(
      map(songs => [...songs].sort(() => Math.random() - 0.5)),
      catchError(err => {
        console.error('Failed to load KK songs:', err);
        return of([] as KKSong[]);
      })
    ),
    { initialValue: [] as KKSong[] }
  );
  readonly selectedKkSong = signal<KKSong | null>(null);

  showDescription(kkSong: KKSong): void {
    this.selectedKkSong.set(kkSong);
  }

  closeDescription(): void {
    this.selectedKkSong.set(null);
  }
}
