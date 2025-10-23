import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {RatingService} from "../../../utils/rating-bar/service/rating.service";
import {RouterLink} from "@angular/router";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {KKSong} from "./kk-song.interface";
import {KkModalComponent} from "./kk-modal/kk-modal.component";
import {SoundtrackModalComponent} from "../soundtrack-modal/soundtrack-modal.component";

@Component({
  selector: 'app-kk',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RatingBarComponent, RouterLink, CloseButtonComponent, KkModalComponent, SoundtrackModalComponent],
  templateUrl: './kk.component.html',
  styleUrls: ['./kk.component.css']
})
export default class KkComponent implements OnInit {
  kkSongs: KKSong[] = [];
  selectedKkSong: KKSong | null = null;

  constructor(private http: HttpClient, private ratingService: RatingService) {}

  ngOnInit(): void {
    this.loadKkSongs();
  }

  loadKkSongs(): void {
    this.http.get<{ kkSongs: KKSong[] }>('assets/data/kk.json').subscribe({
      next: (data) => {
        this.kkSongs = data.kkSongs;
        this.getRatings();
        this.kkSongs = this.kkSongs.sort(() => Math.random() - 0.5);
      },
      error: (err) => {
        console.error('Failed to load KK songs:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.kkSongs.map(kkSong => kkSong.id))
      .subscribe(kkSongRatings => {
        this.kkSongs = this.kkSongs.map(kkSong => {
          const ratingData = kkSongRatings.find(rating => rating.id === kkSong.id);
          if (ratingData) {
            kkSong.rating = ratingData.ratings;
          } else {
            kkSong.rating = [0,0,0,0,0,0];
          }
          return kkSong;
        });
      });
  }

  showDescription(kkSong: KKSong): void {
    this.selectedKkSong = kkSong;
  }

  closeDescription(): void {
    this.selectedKkSong = null;
  }
}
