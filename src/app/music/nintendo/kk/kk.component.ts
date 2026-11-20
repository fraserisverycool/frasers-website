import { Component, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {KKSong} from "./kk-song.interface";
import {KkModalComponent} from "./kk-modal/kk-modal.component";
import {MusicService} from "../../service/music.service";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-kk',
  imports: [NgOptimizedImage, KkModalComponent, ImageUrlPipe],
  templateUrl: './kk.component.html',
  standalone: true,
  styleUrls: ['./kk.component.css']
})
export default class KkComponent implements OnInit {
  kkSongs: KKSong[] = [];
  selectedKkSong: KKSong | null = null;

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadKkSongs();
  }

  loadKkSongs(): void {
    this.musicService.getKkSongs().subscribe({
      next: (songs) => {
        this.kkSongs = [...songs].sort(() => Math.random() - 0.5);
      },
      error: (err) => {
        console.error('Failed to load KK songs:', err);
      },
    });
  }

  showDescription(kkSong: KKSong): void {
    this.selectedKkSong = kkSong;
  }

  closeDescription(): void {
    this.selectedKkSong = null;
  }
}
