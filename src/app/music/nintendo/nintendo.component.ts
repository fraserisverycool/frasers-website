import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {RouterLink, RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Soundtrack} from "./soundtrack.interface";
import {DurstloescherModalComponent} from "../../community/durstloescher/durstloescher-model/durstloescher-modal.component";
import {SoundtrackModalComponent} from "./soundtrack-modal/soundtrack-modal.component";

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
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule, NgOptimizedImage, DurstloescherModalComponent, SoundtrackModalComponent],
  templateUrl: './nintendo.component.html',
  styleUrls: ['./nintendo.component.css']
})
export default class NintendoComponent implements OnInit {
  soundtracks: Soundtrack[] = [];
  originalSoundtracks: Soundtrack[] = [];
  selectedSoundtrack: Soundtrack | null = null;
  searchTerm: string = '';

  platformRank: Record<string, number> = platformOrder.reduce((acc, platform, index) => {
    acc[platform] = index;
    return acc;
  }, {} as Record<string, number>);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSoundtracks();
  }

  loadSoundtracks(): void {
    this.http.get<{ soundtracks: Soundtrack[] }>('assets/music/nintendo/soundtracks.json').subscribe({
      next: (data) => {
        this.originalSoundtracks = data.soundtracks;
        this.sortSoundtracks('release');
      },
      error: (err) => {
        console.error('Failed to load soundtracks:', err);
      },
    });
  }

  get filteredSoundtracks(): Soundtrack[] {
    if (!this.searchTerm) {
      return this.soundtracks;
    }
    return this.soundtracks.filter(soundtrack => {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      return soundtrack.name.toLowerCase().includes(lowerCaseSearchTerm);
    });
  }

  showDescription(soundtrack: Soundtrack): void {
    setTimeout(() => {
      this.selectedSoundtrack = soundtrack;
    }, 0);
  }

  closeDescription(): void {
    this.selectedSoundtrack = null;
  }

  sortSoundtracks(criteria: 'random' | 'release' | 'alphabeticalName' | 'platform'): void {
    switch (criteria) {
      case 'release':
        this.soundtracks = this.originalSoundtracks;
        break;
      case 'random':
        this.soundtracks = [...this.originalSoundtracks].sort(() => Math.random() - 0.5);
        break;
      case 'alphabeticalName':
        this.soundtracks = [...this.originalSoundtracks].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'platform':
        this.soundtracks = [...this.originalSoundtracks].sort((a, b) => {
          const rankA = this.platformRank[a.platform] ?? Number.MAX_SAFE_INTEGER;
          const rankB = this.platformRank[b.platform] ?? Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        });
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
