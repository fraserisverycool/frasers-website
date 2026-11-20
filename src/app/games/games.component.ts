import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Game} from "./game.interface";
import {GameComponent} from "./game/game.component";
import {GameService, PLATFORM_ORDER, PLATFORM_RANK} from "./service/game.service";
import {InfiniteScrollDirective} from "../utils/directives/infinite-scroll.directive";

@Component({
    selector: 'app-games',
    imports: [CommonModule, GameComponent, FormsModule, InfiniteScrollDirective],
    templateUrl: './games.component.html',
    styleUrls: ['./games.component.css']
})
export default class GamesComponent implements OnInit {
  games: Game[] = [];
  originalGames: Game[] = [];
  title: string = "Games Fraser has played since 2020";
  filters = ["all", "2025", "2024", "2023", "2022", "2021", "2020", "older", "random", "name", "vibes", "gameplay", "release", "platform", "next"];
  platformOrder: string[] = PLATFORM_ORDER;
  platformRank: Record<string, number> = PLATFORM_RANK;

  private _searchTerm: string = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.resetInfiniteScroll();
  }

  currentFilter: string = '';
  isPlatformSelected: boolean = false;

  pageSize = 10;
  itemsToShow = 10;

  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadMore(): void {
    if (this.itemsToShow < this.filteredGames.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow = this.pageSize;
  }

  loadGames(): void {
    this.gameService.getGames().subscribe({
      next: (games) => {
        this.originalGames = games;
        this.sortGames('all');
      },
      error: (err) => {
        console.error('Failed to load games:', err);
      }
    });
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
    this.resetInfiniteScroll();
    this.currentFilter = criteria;
    switch (criteria) {
      case 'next':
        this.router.navigate(['/games/next']);
        break;
      case 'all':
        this.games = this.originalGames;
        this.isPlatformSelected = false;
        this.title = "All games Fraser has ever played most recent first";
        break;
      case '2025':
        this.games = this.originalGames.filter(game => game.year.includes('2025'));
        this.games = [...this.games].sort((a, b) => b.score - a.score);
        this.isPlatformSelected = false;
        this.title = "Games Fraser played in 2025 ranked";
        break;
      case '2024':
        this.games = this.originalGames.filter(game => game.year.includes('2024'));
        this.games = [...this.games].sort((a, b) => b.score - a.score);
        this.isPlatformSelected = false;
        this.title = "Games Fraser played in 2024 ranked";
        break;
      case '2023':
        this.games = this.originalGames.filter(game => game.year.includes('2023'));
        this.games = [...this.games].sort((a, b) => b.score - a.score);
        this.isPlatformSelected = false;
        this.title = "Games Fraser played in 2023 ranked";
        break;
      case '2022':
        this.games = this.originalGames.filter(game => game.year.includes('2022'));
        this.games = [...this.games].sort((a, b) => b.score - a.score);
        this.isPlatformSelected = false;
        this.title = "Games Fraser played in 2022 ranked";
        break;
      case '2021':
        this.games = this.originalGames.filter(game => game.year.includes('2021'));
        this.games = [...this.games].sort((a, b) => b.score - a.score);
        this.isPlatformSelected = false;
        this.title = "Games Fraser played in 2021 ranked";
        break;
      case '2020':
        this.games = this.originalGames.filter(game => game.year.includes('2020'));
        this.games = [...this.games].sort((a, b) => b.score - a.score);
        this.isPlatformSelected = false;
        this.title = "Games Fraser played in 2020 ranked";
        break;
      case 'older':
        this.games = this.originalGames.filter(game => game.year.includes('older'));
        this.isPlatformSelected = false;
        this.title = "Games Fraser played in the years before he started recording this stuff in 2020. Let me know if I missed something!";
        break;
      case 'random':
        this.games = [...this.originalGames].sort(() => Math.random() - 0.5);
        this.isPlatformSelected = false;
        this.title = "Games Fraser has written about ordered randomly";
        break;
      case 'name':
        this.games = [...this.originalGames].sort((a, b) => a.name.localeCompare(b.name));
        this.isPlatformSelected = false;
        this.title = "Games Fraser has written about ordered by name";
        break;
      case 'vibes':
        this.games = [...this.originalGames].sort((a, b) => b.vibes - a.vibes);
        this.isPlatformSelected = false;
        this.title = "Games Fraser has written about ordered by vibes";
        break;
      case 'gameplay':
        this.games = [...this.originalGames].sort((a, b) => b.gameplay - a.gameplay);
        this.isPlatformSelected = false;
        this.title = "Games Fraser has written about ordered by gameplay";
        break;
      case 'release':
        this.games = [...this.originalGames].sort((a, b) => a.release - b.release);
        this.isPlatformSelected = false;
        this.title = "Games Fraser has written about ordered by release year";
        break;
      case 'platform':
        this.games = [...this.originalGames].sort((a, b) => {
          const rankA = this.platformRank[a.platform] ?? Number.MAX_SAFE_INTEGER;
          const rankB = this.platformRank[b.platform] ?? Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        });
        this.isPlatformSelected = true;
        this.title = "Games Fraser has written about ordered by platform";
        break;
      default:
        this.games = [...this.originalGames].filter(game => game.platform == criteria)
        this.games = [...this.games].sort((a, b) => a.release - b.release);
        this.isPlatformSelected = true;
        this.title = "Games on " + criteria + " that Fraser has written about"
    }
  }
}
