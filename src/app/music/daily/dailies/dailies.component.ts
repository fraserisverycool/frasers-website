import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {DailySoundtrack} from "../daily-soundtrack.interface";
import {DomSanitizer} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";
import {RatingService} from "../../../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {isBefore, parse} from "date-fns";

@Component({
  selector: 'app-dailies',
  standalone: true,
  imports: [CommonModule, RatingBarComponent],
  templateUrl: './dailies.component.html',
  styleUrls: ['./dailies.component.css']
})
export default class DailiesComponent implements OnInit {
  dailySoundtracks: DailySoundtrack[] = [];
  today: DailySoundtrack | null = null;

  constructor(private http: HttpClient, private ratingService: RatingService, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.loadDailySoundtracks();
  }

  loadDailySoundtracks(): void {
    this.http.get<{ dailysoundtracks: DailySoundtrack[] }>('assets/music/daily/daily-soundtracks.json').subscribe({
      next: (data) => {
        const now = new Date();
        this.dailySoundtracks = data.dailysoundtracks.filter(
          ds => isBefore(parse(ds.day, 'dd-MM-yyyy', new Date()), now)
        );
        this.dailySoundtracks.forEach(ds => ds.link = this.sanitizer.bypassSecurityTrustResourceUrl(ds.link) as string);
        this.getRatings();
        this.today = this.dailySoundtracks.find(dailySoundtrack => dailySoundtrack.day === this.todaysDate()) || null;
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

    return `${day}-${month}-${year}`;
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
