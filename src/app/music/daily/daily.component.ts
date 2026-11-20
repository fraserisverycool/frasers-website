import { Component, computed, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import {DailySoundtrack} from "./daily-soundtrack.interface";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {RouterLink} from "@angular/router";
import {RatingHydrationService} from "../../utils/rating-bar/service/rating-hydration.service";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-daily',
  imports: [RatingBarComponent, RouterLink, ImageUrlPipe],
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.css']
})
export class DailyComponent {
  private http = inject(HttpClient);
  private ratingHydration = inject(RatingHydrationService);
  private sanitizer = inject(DomSanitizer);

  readonly dailySoundtracks = toSignal(
    this.http.get<{ dailysoundtracks: DailySoundtrack[] }>('assets/data/daily-soundtracks.json').pipe(
      switchMap(data => this.ratingHydration.hydrateRatings(data.dailysoundtracks)),
      map(hydrated => hydrated as DailySoundtrack[]),
      catchError(err => {
        console.error('Failed to load daily Soundtracks:', err);
        return of([] as DailySoundtrack[]);
      })
    ),
    { initialValue: [] as DailySoundtrack[] }
  );
  readonly today = computed(() =>
    this.dailySoundtracks().find(dailySoundtrack => dailySoundtrack.day === this.todaysDate()) || null
  );
  readonly safeLink = computed<SafeResourceUrl | null>(() => {
    const today = this.today();
    if (!today) return null;
    return typeof(today.link) === 'string'
      ? this.getSafeEmbedUrl(today.link)
      : this.getUnsafeEmbedUrl(today.link);
  });
  readonly audioPath: string = '/music/dailysoundtracks/';

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
