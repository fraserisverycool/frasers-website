import { Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { ImageUrlPipe } from '../../../utils/pipes/image-url.pipe';

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
  imports: [NgClass, ImageUrlPipe],
  templateUrl: './smash-track.component.html',
  styleUrl: './smash-track.component.css'
})
export class SmashTrackComponent {
  readonly track = input.required<Track>();
  readonly play = output<Track>();

  readonly franchiseIcon = computed(() => this.getFranchiseIcon(this.track().comment));
  readonly trackClass = computed(() => this.getTrackClass(this.track().comment));
  readonly starList = computed(() => this.getStars(this.track().stars));

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
    this.play.emit(this.track());
  }
}
