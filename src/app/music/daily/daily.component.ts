import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {RatingService} from "../../utils/rating-bar/service/rating.service";
import {DailySoundtrack} from "./daily-soundtrack.interface";
import {DomSanitizer, SafeResourceUrl, SafeUrl} from "@angular/platform-browser";
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
          if (typeof(this.today.link) === 'string') {
            this.safeLink = this.getSafeEmbedUrl(this.today.link);
          } else {
            this.safeLink = this.getUnsafeEmbedUrl(this.today.link);
          }
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

  private getEmbedUrl(link: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link.match(regExp);

    if (match && match[2].length == 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    } else {
      console.error(`Could not extract video ID for url: ${link}`);
      return '';
    }
  }

  private getSafeEmbedUrl(link: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.getEmbedUrl(link))
  }

  private getUnsafeEmbedUrl(link: SafeResourceUrl) {
    let realUrl = (link as any).changingThisBreaksApplicationSecurity as string;
    let embed = this.getEmbedUrl(realUrl);
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  }
}
