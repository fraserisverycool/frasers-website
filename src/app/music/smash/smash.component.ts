import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { forkJoin, map, switchMap } from 'rxjs';
import { ImageService } from '../../utils/services/image.service';

interface Track {
  id: string;
  filename: string;
  path: string;
  image: string;
  description: string;
  stars: string;
  duration: number;
  track: string;
  title: string;
  composers: string;
  contributors: string;
  album: string;
  'original-game': string;
  comment: string;
  removed: boolean;
  volume: string;
  release: string;
}

interface VolumeInfo {
  count: number;
  file: string;
  notes?: string;
}

interface IndexData {
  [key: string]: VolumeInfo;
}

interface Volume {
  title: string;
  tracks: Track[];
  expanded: boolean;
  notes?: string;
}

@Component({
  selector: 'app-smash',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './smash.component.html',
  styleUrl: './smash.component.css',
})
export default class SmashComponent implements OnInit {
  volumes: Volume[] = [];
  loading = true;

  constructor(private http: HttpClient, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.http.get<IndexData>('assets/data/smash/index.json').pipe(
      switchMap(indexData => {
        const volumeRequests = Object.keys(indexData).map(fullTitle => {
          const info = indexData[fullTitle];
          const file = info.file;
          // Extract series name: "Super Smash Bros. Anthology Vol. 17 - Pikmin (Wii...)" -> "Pikmin"
          const titleParts = fullTitle.split(' - ');
          let displayTitle = fullTitle;
          if (titleParts.length > 1) {
            displayTitle = titleParts[1].split(' (')[0];
          }

          return this.http.get<Track[]>(`assets/data/smash/${file}`).pipe(
            map(tracks => ({
              title: displayTitle,
              tracks: tracks.map(t => ({...t, path: t.path.replace(/\\/g, '/')})),
              expanded: false,
              notes: info.notes
            }))
          );
        });
        return forkJoin(volumeRequests);
      })
    ).subscribe({
      next: (volumes) => {
        this.volumes = volumes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading smash data', err);
        this.loading = false;
      }
    });
  }

  toggleVolume(volume: Volume): void {
    volume.expanded = !volume.expanded;
  }

  getFranchiseIcon(comment: string): string | null {
    if (!comment) return null;
    if (comment.includes('64')) return 'ssb.png';
    if (comment.includes('Melee')) return 'ssbm.png';
    if (comment.includes('Brawl')) return 'ssbb.png';
    if (comment.includes('Smash 4')) return 'ssb4.png';
    if (comment.includes('Ultimate')) return 'ssbu.png';
    return null;
  }

  getTrackClass(comment: string): string {
    if (!comment) return '';
    if (comment.includes('64')) return 'bg-64';
    if (comment.includes('Melee')) return 'bg-melee';
    if (comment.includes('Brawl')) return 'bg-brawl';
    if (comment.includes('Smash 4')) return 'bg-smash4';
    if (comment.includes('Ultimate')) return 'bg-ultimate';
    return '';
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getStars(stars: string): number[] {
    const count = parseInt(stars, 10);
    return isNaN(count) ? [] : Array(count).fill(0);
  }
}
