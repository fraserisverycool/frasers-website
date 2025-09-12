import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Subscription } from 'rxjs';
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";

interface Mp3Info {
  filename: string;
  name: string;
  description: string;
  rating: number[];
  id: string;
}

@Component({
  selector: 'app-mixes',
  standalone: true,
  imports: [CommonModule, RatingBarComponent],
  templateUrl: './mixes.component.html',
  styleUrls: ['./mixes.component.css']
})
export default class MixesComponent implements OnInit {
  mp3Files: Mp3Info[] = [];
  color: String = "#000000"

  constructor(private http: HttpClient, private ratingService: RatingService) {}

  ngOnInit(): void {
    this.loadMixes();
    this.color = this.getRandomColor();
  }

  loadMixes(): void {
    this.http.get<{ mixes: Mp3Info[] }>('assets/music/mixes/mixes.json').subscribe({
      next: (data) => {
        this.mp3Files = data.mixes;
        this.getRatings();
      },
      error: (err) => {
        console.error('Failed to load mixes:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.mp3Files.map(mp3File => mp3File.id))
      .subscribe(mp3FileRatings => {
        this.mp3Files = this.mp3Files.map(mp3File => {
          const ratingData = mp3FileRatings.find(rating => rating.id === mp3File.id);
          if (ratingData) {
            mp3File.rating = ratingData.ratings;
          } else {
            mp3File.rating = [0,0,0,0,0,0];
          }
          return mp3File;
        });
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
