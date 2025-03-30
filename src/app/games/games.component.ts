import { Component, OnInit, Injectable  } from '@angular/core';
import { CommonModule, NgOptimizedImage, NgFor } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Game {
  name: string;
  vibes: number;
  gameplay: number;
  review: string[];
  image: string;
  platform: string;
  year: string;
  story: boolean;
}

const platformOrder = [
  "NES",
  "Gameboy",
  "SNES",
  "Nintendo 64",
  "GBA",
  "Gamecube",
  "DS",
  "Wii",
  "3DS",
  "Wii U",
  "Switch",
  "PS1",
  "PS2",
  "PS3",
  "PS4",
  "PS5",
  "Xbox Gamepass",
  "Mobile",
  "PC"
];

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule, NgOptimizedImage],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export default class GamesComponent implements OnInit {
  games: Game[] = [];
  originalGames: Game[] = [];
  title: string = "Games Fraser has played since 2020";
  filters = ["all", "2025", "2024", "2023", "2022", "2021", "2020", "random", "name", "vibes", "gameplay", "platform", "next"];
  searchTerm: string = '';

  platformRank: Record<string, number> = platformOrder.reduce((acc, platform, index) => {
    acc[platform] = index;
    return acc;
  }, {} as Record<string, number>);

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.http.get<{ games: any[] }>('assets/games/games.json').pipe(
      map(data => {
        const parsedGames: Game[] = data.games.map((game: any) => {
          const vibes = parseInt(game.vibes, 10);
          const gameplay = parseInt(game.gameplay, 10);

          return {
            ...game,
            vibes: isNaN(vibes) ? 0 : vibes,
            gameplay: isNaN(gameplay) ? 0 : gameplay,
          } as Game;
        });
        return parsedGames;
      }),
      catchError(err => {
        console.error('Failed to load games:', err);
        return of([] as Game[]);
      })
    ).subscribe(
      (parsedGames) => {
        this.originalGames = parsedGames;
        this.sortGames('all');
      }
    );
  }

  get filteredGames(): Game[] {
    if (!this.searchTerm) {
      return this.games;
    }
    return this.games.filter(game => {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      return game.name.toLowerCase().includes(lowerCaseSearchTerm);
    });
  }

  sortGames(criteria: string): void {
    switch (criteria) {
      case 'next':
        this.router.navigate(['/games/next']);
        break;
      case 'all':
        this.games = this.originalGames;
        this.title = "Games Fraser has played since 2020";
        break;
      case '2025':
        this.games = this.originalGames.filter(game => game.year.includes('2025'));
        this.title = "Games Fraser played in 2025";
        break;
      case '2024':
        this.games = this.originalGames.filter(game => game.year.includes('2024'));
        this.title = "Games Fraser played in 2024";
        break;
      case '2023':
        this.games = this.originalGames.filter(game => game.year.includes('2023'));
        this.title = "Games Fraser played in 2023";
        break;
      case '2022':
        this.games = this.originalGames.filter(game => game.year.includes('2022'));
        this.title = "Games Fraser played in 2022";
        break;
      case '2021':
        this.games = this.originalGames.filter(game => game.year.includes('2021'));
        this.title = "Games Fraser played in 2021";
        break;
      case '2020':
        this.games = this.originalGames.filter(game => game.year.includes('2020'));
        this.title = "Games Fraser played in 2020";
        break;
      case 'random':
        this.games = [...this.originalGames].sort(() => Math.random() - 0.5);
        this.title = "Games Fraser has played since 2020 ordered randomly";
        break;
      case 'name':
        this.games = [...this.originalGames].sort((a, b) => a.name.localeCompare(b.name));
        this.title = "Games Fraser has played since 2020 ordered by name";
        break;
      case 'vibes':
        this.games = [...this.originalGames].sort((a, b) => b.vibes - a.vibes);
        this.title = "Games Fraser has played since 2020 ordered by vibes";
        break;
      case 'gameplay':
        this.games = [...this.originalGames].sort((a, b) => b.gameplay - a.gameplay);
        this.title = "Games Fraser has played since 2020 ordered by gameplay";
        break;
      case 'platform':
        this.games = [...this.originalGames].sort((a, b) => {
          const rankA = this.platformRank[a.platform] ?? Number.MAX_SAFE_INTEGER;
          const rankB = this.platformRank[b.platform] ?? Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        });
        this.title = "Games Fraser has played since 2020 ordered by platform";
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
