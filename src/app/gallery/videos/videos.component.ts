import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";

interface Video {
  link: string;
  title: string;
  description: string;
  embedUrl?: SafeResourceUrl;
  rating: number[];
  id: string;
  newsletter: boolean;
  timestamp?: string;
}


@Component({
    selector: 'app-videos',
    imports: [],
    templateUrl: './videos.component.html',
    styleUrls: ['./videos.component.css']
})
export default class VideosComponent {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  readonly videos = toSignal(
    this.http.get<{ videos: Video[] }>('assets/data/videos.json').pipe(
      map(data => data.videos.map(video => ({
        ...video,
        embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(this.getEmbedUrl(video.link))
      }))),
      catchError(error => {
        console.error('Error fetching video data:', error);
        return of([] as Video[]);
      })
    ),
    { initialValue: [] as Video[] }
  );

  private getEmbedUrl(link: string): string {
    try {
      const url = new URL(link);
      let videoId: string | null = null;

      if (url.hostname === 'youtu.be') {
        // Short URL
        videoId = url.pathname.substring(1);
      } else if (url.pathname.startsWith('/shorts/')) {
        // YouTube Shorts
        videoId = url.pathname.split('/')[2];
      } else {
        // Regular watch URL
        videoId = url.searchParams.get('v');
      }

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : '';
    } catch (error) {
      console.error('Invalid YouTube URL:', link);
      return '';
    }
  }
}
