import {Component, OnInit} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {DailySoundtrack} from "./daily-soundtrack.interface";
import {DomSanitizer, SafeResourceUrl, SafeUrl} from "@angular/platform-browser";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {RouterLink} from "@angular/router";
import {RatingHydrationService} from "../../utils/rating-bar/service/rating-hydration.service";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-daily',
  imports: [RatingBarComponent, RouterLink, ImageUrlPipe],
  templateUrl: './daily.component.html',
  standalone: true,
  styleUrls: ['./daily.component.css']
})
export class DailyComponent implements OnInit {
  dailySoundtracks: DailySoundtrack[] = [];
  today: DailySoundtrack | null = null;
  safeLink: SafeUrl | null = null;
  audioPath: string = '/music/dailysoundtracks/';

  constructor(
    private http: HttpClient,
    private ratingHydration: RatingHydrationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadDailySoundtracks();
  }

  loadDailySoundtracks(): void {
    this.http.get<{ dailysoundtracks: DailySoundtrack[] }>('assets/data/daily-soundtracks.json').subscribe({
      next: (data) => {
        this.ratingHydration.hydrateRatings(data.dailysoundtracks).subscribe(hydrated => {
          this.dailySoundtracks = hydrated as DailySoundtrack[];
          this.today = this.dailySoundtracks.find(dailySoundtrack => dailySoundtrack.day === this.todaysDate()) || null;
          if (this.today) {
            if (typeof(this.today.link) === 'string') {
              this.safeLink = this.getSafeEmbedUrl(this.today.link);
            } else {
              this.safeLink = this.getUnsafeEmbedUrl(this.today.link);
            }
          }
        });
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
