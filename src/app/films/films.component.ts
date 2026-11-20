import { Component, OnInit, computed, inject, linkedSignal, signal } from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Film} from "./film.interface";
import {FilmComponent} from "./film/film.component";
import {FilmService} from "./service/film.service";
import {InfiniteScrollDirective} from "../utils/directives/infinite-scroll.directive";

@Component({
    selector: 'app-films',
    imports: [FormsModule, FilmComponent, InfiniteScrollDirective],
    templateUrl: './films.component.html',
    styleUrls: ['./films.component.css']
})
export default class FilmsComponent implements OnInit {
  private router = inject(Router);
  private filmService = inject(FilmService);

  readonly films = signal<Film[]>([]);
  private originalFilms: Film[] = [];
  readonly title = signal("Films Fraser has watched since 2013");
  readonly filters = ["all", "2025", "2024", "2023", "random", "alphabetical", "release", "tv shows", "next"];

  readonly searchTerm = signal('');

  private readonly pageSize = 10;
  /** Resets to one page whenever the search term changes. */
  readonly itemsToShow = linkedSignal({
    source: this.searchTerm,
    computation: () => this.pageSize
  });

  readonly filteredFilms = computed(() => {
    const searchTerm = this.searchTerm();
    if (!searchTerm) {
      return this.films();
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return this.films().filter(film => film.title.toLowerCase().includes(lowerCaseSearchTerm));
  });

  readonly visibleFilms = computed(() => this.filteredFilms().slice(0, this.itemsToShow()));

  ngOnInit(): void {
    this.loadFilms();
  }

  loadMore(): void {
    if (this.itemsToShow() < this.filteredFilms().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow.set(this.pageSize);
  }

  loadFilms(): void {
    this.filmService.getFilms().subscribe({
      next: (films) => {
        this.originalFilms = films;
        this.sortFilms('all');
      },
      error: (err) => {
        console.error('Failed to load films:', err);
      },
    });
  }

  sortFilms(criteria: string): void {
    this.resetInfiniteScroll();
    switch (criteria) {
      case 'next':
        this.router.navigate(['/films/next']);
        break;
      case 'all':
        this.films.set(this.originalFilms);
        this.title.set("Films Fraser has watched since 2023");
        break;
      case '2025':
        this.films.set(this.originalFilms.filter(film => film.year.includes('2025')));
        this.title.set("Films Fraser watched in 2025");
        break;
      case '2024':
        this.films.set(this.originalFilms.filter(film => film.year.includes('2024')));
        this.title.set("Films Fraser watched in 2024");
        break;
      case '2023':
        this.films.set(this.originalFilms.filter(film => film.year.includes('2023')));
        this.title.set("Films Fraser watched in 2023");
        break;
      case 'random':
        this.films.set([...this.originalFilms].sort(() => Math.random() - 0.5));
        this.title.set("Films Fraser has watched since 2023 ordered randomly");
        break;
      case 'alphabetical':
        this.films.set([...this.originalFilms].sort((a, b) => a.title.localeCompare(b.title)));
        this.title.set("Films Fraser has watched since 2023 ordered by name");
        break;
      case 'release':
        this.films.set([...this.originalFilms].sort((a, b) => a.release - b.release));
        this.title.set("Films Fraser has watched since 2023 ordered by release date");
        break;
      case 'tv shows':
        this.films.set(this.originalFilms.filter(film => film.tv));
        this.title.set("TV shows Fraser has watched since 2023");
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
