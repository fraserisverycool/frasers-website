import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {DailySoundtrack} from "./daily-soundtrack.interface";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-daily',
  standalone: true,
  imports: [CommonModule, RatingBarComponent, RouterLink],
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.css']
})
export class DailyComponent implements OnInit {
  dailySoundtracks: DailySoundtrack[] = [];
  today: DailySoundtrack | null = null;
  safeLink: SafeUrl | null = null;

  constructor(private http: HttpClient, private ratingService: RatingService, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.loadDailySoundtracks();
  }

  loadDailySoundtracks(): void {
    this.http.get<{ dailysoundtracks: DailySoundtrack[] }>('assets/music/daily/daily-soundtracks.json').subscribe({
      next: (data) => {
        this.dailySoundtracks = data.dailysoundtracks;
        this.getRatings();
        this.today = this.dailySoundtracks.find(dailySoundtrack => dailySoundtrack.day === this.todaysDate()) || null;
        if (this.today) {
          this.safeLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.today.embed);
        }
      },
      error: (err) => {
        console.error('Failed to load daily Soundtracks:', err);
      },
    });
  }

  todaysDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${month}-${day}-${year}`;
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.dailySoundtracks.map(dailySoundtrack => dailySoundtrack.id))
      .subscribe(dailySoundtrackRatings => {
        this.dailySoundtracks = this.dailySoundtracks.map(dailySoundtrack => {
          const ratingData = dailySoundtrackRatings.find(rating => rating.id === dailySoundtrack.id);
          if (ratingData) {
            dailySoundtrack.rating = ratingData.ratings;
          } else {
            dailySoundtrack.rating = [0,0,0,0,0,0];
          }
          return dailySoundtrack;
        });
      });
  }
}
