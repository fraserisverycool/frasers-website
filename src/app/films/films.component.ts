import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Film} from "./film.interface";
import {FilmComponent} from "./film/film.component";
import {RatingService} from "../utils/rating-bar/service/rating.service";

@Component({
    selector: 'app-films',
    imports: [FormsModule, FilmComponent],
    templateUrl: './films.component.html',
    styleUrls: ['./films.component.css']
})
export default class FilmsComponent implements OnInit, AfterViewInit, OnDestroy {
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
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(private http: HttpClient, private router: Router, private ratingService: RatingService) {}

  ngOnInit(): void {
    this.loadFilms();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.loadMore();
      }
    }, {
      rootMargin: '100px'
    });

    if (this.scrollAnchor) {
      this.observer.observe(this.scrollAnchor.nativeElement);
    }
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
    this.http.get<{ films: Film[] }>('assets/data/films.json').subscribe({
      next: (data) => {
        this.originalFilms = data.films;
        this.getRatings();
        this.sortFilms('all');

      },
      error: (err) => {
        console.error('Failed to load films:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.originalFilms.map(film => film.id))
      .subscribe(filmRatings => {
        this.originalFilms = this.originalFilms.map(film => {
          const ratingData = filmRatings.find(rating => rating.id === film.id);
          if (ratingData) {
            film.rating = ratingData.ratings;
          } else {
            film.rating = [0,0,0,0,0,0];
          }
          return film;
        });
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
