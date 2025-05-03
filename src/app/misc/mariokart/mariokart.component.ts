import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";

interface Track {
  id: number;
  name: string;
  game: string;
  originalgame: string;
  music: number;
  vibes: number;
  track: number;
  ranking: number;
  description: string;
  image: string;
}

@Component({
  selector: 'app-mariokart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mariokart.component.html',
  styleUrls: ['./mariokart.component.css']
})
export default class MariokartComponent implements OnInit{
  tracks: Track[] = [];
  originalTracks: Track[] = [];

  gameMap = {
    'snes': 'Super Mario Kart',
    'n64': 'Mario Kart 64',
    'gba': 'Mario Kart: Super Circuit',
    'gcn': 'Mario Kart: Double Dash!!',
    'ds': 'Mario Kart DS',
    'wii': 'Mario Kart Wii',
    '3ds': 'Mario Kart 7',
    'mk8': 'Mario Kart 8 Deluxe',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTracks();
  }

  loadTracks(): void {
    this.http.get<{ tracks: Track[] }>('assets/misc/mariokart/mariokart.json').subscribe({
      next: (data) => {
        this.originalTracks = data.tracks;
        this.filterTracks('gba');
      },
      error: (err) => {
        console.error('Failed to load tracks:', err);
      },
    });
  }

  orderUnchanged = (): number => {
    return 0;
  }

  filterTracks(criteria: string): void {
    let gameName = this.gameMap[criteria as keyof typeof this.gameMap];
    if (gameName) {
      this.tracks = [...this.originalTracks].filter((track) => track.game === gameName);
    } else {
      console.error('Invalid filtering criteria');
    }
  }

  getKeyByValue(object: Record<string, string>, value: string): string | undefined {
    return Object.keys(object).find(key => object[key] === value)?.toUpperCase();
  }
}

