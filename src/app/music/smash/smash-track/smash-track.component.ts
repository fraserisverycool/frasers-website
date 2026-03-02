import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ImageService } from '../../../utils/services/image.service';

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

@Component({
  selector: 'app-smash-track',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './smash-track.component.html',
  styleUrl: './smash-track.component.css'
})
export class SmashTrackComponent {
  @Input() track!: Track;
  @Output() play = new EventEmitter<Track>();

  constructor(protected imageService: ImageService) {}

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
    if (comment.includes('3DS')) return 'bg-3ds';
    if (comment.includes('Smash 4')) return 'bg-smash4';
    if (comment.includes('Ultimate')) return 'bg-ultimate';
    return '';
  }

  getStars(stars: string): number[] {
    const count = parseInt(stars, 10);
    return isNaN(count) ? [] : Array(count).fill(0);
  }

  onPlay(): void {
    this.play.emit(this.track);
  }
}
