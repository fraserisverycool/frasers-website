import {Component, OnInit} from '@angular/core';
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
  films: Film[] = [];
  originalFilms: Film[] = [];
  title: string = "Films Fraser has watched since 2013";
  filters = ["all", "2025", "2024", "2023", "random", "alphabetical", "release", "tv shows", "next"];

  private _searchTerm: string = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.resetInfiniteScroll();
  }

  pageSize = 10;
  itemsToShow = 10;

  constructor(private router: Router, private filmService: FilmService) {}

  ngOnInit(): void {
    this.loadFilms();
  }

  loadMore(): void {
    if (this.itemsToShow < this.filteredFilms.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow = this.pageSize;
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

  get filteredFilms(): Film[] {
    if (!this.searchTerm) {
      return this.films;
    }
    return this.films.filter(film => {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      return film.title.toLowerCase().includes(lowerCaseSearchTerm);
    });
  }

  sortFilms(criteria: string): void {
    this.resetInfiniteScroll();
    switch (criteria) {
      case 'next':
        this.router.navigate(['/films/next']);
        break;
      case 'all':
        this.films = this.originalFilms;
        this.title = "Films Fraser has watched since 2023";
        break;
      case '2025':
        this.films = this.originalFilms.filter(film => film.year.includes('2025'));
        this.title = "Films Fraser watched in 2025";
        break;
      case '2024':
        this.films = this.originalFilms.filter(film => film.year.includes('2024'));
        this.title = "Films Fraser watched in 2024";
        break;
      case '2023':
        this.films = this.originalFilms.filter(film => film.year.includes('2023'));
        this.title = "Films Fraser watched in 2023";
        break;
      case 'random':
        this.films = [...this.originalFilms].sort(() => Math.random() - 0.5);
        this.title = "Films Fraser has watched since 2023 ordered randomly";
        break;
      case 'alphabetical':
        this.films = [...this.originalFilms].sort((a, b) => a.title.localeCompare(b.title));
        this.title = "Films Fraser has watched since 2023 ordered by name";
        break;
      case 'release':
        this.films = [...this.originalFilms].sort((a, b) => a.release - b.release);
        this.title = "Films Fraser has watched since 2023 ordered by release date";
        break;
      case 'tv shows':
        this.films = this.originalFilms.filter(film => film.tv);
        this.title = "TV shows Fraser has watched since 2023";
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
