import { Component, OnInit, computed, inject, linkedSignal, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Game} from "./game.interface";
import {GameComponent} from "./game/game.component";
import {GameService, PLATFORM_ORDER, PLATFORM_RANK} from "./service/game.service";
import {InfiniteScrollDirective} from "../utils/directives/infinite-scroll.directive";

@Component({
    selector: 'app-games',
    imports: [NgClass, GameComponent, FormsModule, InfiniteScrollDirective],
    templateUrl: './games.component.html',
    styleUrls: ['./games.component.css']
})
export default class GamesComponent implements OnInit {
  private router = inject(Router);
  private gameService = inject(GameService);

  readonly games = signal<Game[]>([]);
  private originalGames: Game[] = [];
  readonly title = signal("Games Fraser has played since 2020");
  readonly filters = ["all", "2025", "2024", "2023", "2022", "2021", "2020", "older", "random", "name", "vibes", "gameplay", "release", "platform", "next"];
  readonly platformOrder: string[] = PLATFORM_ORDER;
  private readonly platformRank: Record<string, number> = PLATFORM_RANK;

  readonly searchTerm = signal('');

  readonly currentFilter = signal('');
  readonly isPlatformSelected = signal(false);

  private readonly pageSize = 10;
  /** Resets to one page whenever the search term changes. */
  readonly itemsToShow = linkedSignal({
    source: this.searchTerm,
    computation: () => this.pageSize
  });

  readonly filteredGames = computed(() => {
    const searchTerm = this.searchTerm();
    if (!searchTerm) {
      return this.games();
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return this.games().filter(game => game.name.toLowerCase().includes(lowerCaseSearchTerm));
  });

  readonly visibleGames = computed(() => this.filteredGames().slice(0, this.itemsToShow()));

  ngOnInit(): void {
    this.loadGames();
  }

  loadMore(): void {
    if (this.itemsToShow() < this.filteredGames().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow.set(this.pageSize);
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

  private byScore(year: string): Game[] {
    return this.originalGames
      .filter(game => game.year.includes(year))
      .sort((a, b) => b.score - a.score);
  }

  sortGames(criteria: string): void {
    this.resetInfiniteScroll();
    this.currentFilter.set(criteria);
    switch (criteria) {
      case 'next':
        this.router.navigate(['/games/next']);
        break;
      case 'all':
        this.games.set(this.originalGames);
        this.isPlatformSelected.set(false);
        this.title.set("All games Fraser has ever played most recent first");
        break;
      case '2025':
      case '2024':
      case '2023':
      case '2022':
      case '2021':
      case '2020':
        this.games.set(this.byScore(criteria));
        this.isPlatformSelected.set(false);
        this.title.set(`Games Fraser played in ${criteria} ranked`);
        break;
      case 'older':
        this.games.set(this.originalGames.filter(game => game.year.includes('older')));
        this.isPlatformSelected.set(false);
        this.title.set("Games Fraser played in the years before he started recording this stuff in 2020. Let me know if I missed something!");
        break;
      case 'random':
        this.games.set([...this.originalGames].sort(() => Math.random() - 0.5));
        this.isPlatformSelected.set(false);
        this.title.set("Games Fraser has written about ordered randomly");
        break;
      case 'name':
        this.games.set([...this.originalGames].sort((a, b) => a.name.localeCompare(b.name)));
        this.isPlatformSelected.set(false);
        this.title.set("Games Fraser has written about ordered by name");
        break;
      case 'vibes':
        this.games.set([...this.originalGames].sort((a, b) => b.vibes - a.vibes));
        this.isPlatformSelected.set(false);
        this.title.set("Games Fraser has written about ordered by vibes");
        break;
      case 'gameplay':
        this.games.set([...this.originalGames].sort((a, b) => b.gameplay - a.gameplay));
        this.isPlatformSelected.set(false);
        this.title.set("Games Fraser has written about ordered by gameplay");
        break;
      case 'release':
        this.games.set([...this.originalGames].sort((a, b) => a.release - b.release));
        this.isPlatformSelected.set(false);
        this.title.set("Games Fraser has written about ordered by release year");
        break;
      case 'platform':
        this.games.set([...this.originalGames].sort((a, b) => {
          const rankA = this.platformRank[a.platform] ?? Number.MAX_SAFE_INTEGER;
          const rankB = this.platformRank[b.platform] ?? Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        }));
        this.isPlatformSelected.set(true);
        this.title.set("Games Fraser has written about ordered by platform");
        break;
      default:
        this.games.set(this.originalGames
          .filter(game => game.platform == criteria)
          .sort((a, b) => a.release - b.release));
        this.isPlatformSelected.set(true);
        this.title.set("Games on " + criteria + " that Fraser has written about");
    }
  }
}
