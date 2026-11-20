import { Component, OnInit, computed, inject, linkedSignal, signal } from '@angular/core';
import { LowerCasePipe, NgClass, NgOptimizedImage } from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Soundtrack} from "./soundtrack.interface";
import {SoundtrackModalComponent} from "./soundtrack-modal/soundtrack-modal.component";
import {MusicService} from "../service/music.service";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

const platformOrder = [
  "NES",
  "Gameboy",
  "SNES",
  "N64",
  "GBA",
  "Gamecube",
  "DS",
  "Wii",
  "3DS",
  "Wii U",
  "Switch"
];

@Component({
  selector: 'app-nintendo',
  imports: [NgClass, LowerCasePipe, RouterLink, FormsModule, NgOptimizedImage, SoundtrackModalComponent, InfiniteScrollDirective, ImageUrlPipe],
  templateUrl: './soundtracks.component.html',
  styleUrls: ['./soundtracks.component.css']
})
export default class SoundtracksComponent implements OnInit {
  private musicService = inject(MusicService);

  private readonly originalSoundtracks = signal<Soundtrack[]>([]);
  readonly soundtracks = signal<Soundtrack[]>([]);
  readonly selectedSoundtrack = signal<Soundtrack | null>(null);
  readonly searchTerm = signal('');

  readonly platformRank: Record<string, number> = platformOrder.reduce((acc, platform, index) => {
    acc[platform] = index;
    return acc;
  }, {} as Record<string, number>);

  readonly filteredSoundtracks = computed(() => {
    const searchTerm = this.searchTerm();
    if (!searchTerm) {
      return this.soundtracks();
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return this.soundtracks().filter(soundtrack =>
      soundtrack.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  private readonly pageSize = 20;
  /** Resets to one page whenever the filtered list changes (search, sort, load). */
  readonly itemsToShow = linkedSignal({ source: this.filteredSoundtracks, computation: () => this.pageSize });
  readonly visibleSoundtracks = computed(() => this.filteredSoundtracks().slice(0, this.itemsToShow()));

  ngOnInit(): void {
    this.loadSoundtracks();
  }

  loadMore(): void {
    if (this.itemsToShow() < this.filteredSoundtracks().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  loadSoundtracks(): void {
    this.musicService.getSoundtracks().subscribe({
      next: (soundtracks) => {
        this.originalSoundtracks.set(soundtracks);
        this.sortSoundtracks('release');
      },
      error: (err) => {
        console.error('Failed to load soundtracks:', err);
      },
    });
  }

  showDescription(soundtrack: Soundtrack): void {
    // Deferred so the opening click is not treated as a click outside the modal.
    setTimeout(() => {
      this.selectedSoundtrack.set(soundtrack);
    }, 0);
  }

  closeDescription(): void {
    this.selectedSoundtrack.set(null);
  }

  sortSoundtracks(criteria: 'random' | 'release' | 'alphabeticalName' | 'platform'): void {
    const original = this.originalSoundtracks();
    switch (criteria) {
      case 'release':
        this.soundtracks.set([...original]);
        break;
      case 'random':
        this.soundtracks.set([...original].sort(() => Math.random() - 0.5));
        break;
      case 'alphabeticalName':
        this.soundtracks.set([...original].sort((a, b) => a.name.localeCompare(b.name)));
        break;
      case 'platform':
        this.soundtracks.set([...original].sort((a, b) => {
          const rankA = this.platformRank[a.platform] ?? Number.MAX_SAFE_INTEGER;
          const rankB = this.platformRank[b.platform] ?? Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        }));
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
