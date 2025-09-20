import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";

interface Video {
  link: string;
  title: string;
  description: string;
  embedUrl?: SafeResourceUrl;
  rating: number[];
  id: string;
  newsletter: boolean;
}


@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export default class VideoGalleryComponent implements OnInit {
  videos: Video[] = [];

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.http.get<{ videos: Video[] }>('assets/gallery/videos/videos.json').subscribe(
      data => {
        this.videos = data.videos.map(video => ({
          ...video,
          embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(this.getEmbedUrl(video.link))
        }));
      },
      error => {
        console.error('Error fetching video data:', error);
      }
    );
  }

  private getEmbedUrl(link: string): string {
    const videoId = link.split('v=')[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
}
