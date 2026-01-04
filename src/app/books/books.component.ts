import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import {Book} from "./book.interface";
import {RatingService} from "../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../utils/rating-bar/rating-bar.component";
import {ImageService} from "../utils/services/image.service";

@Component({
    selector: 'app-books',
    imports: [CommonModule, NgOptimizedImage, RatingBarComponent],
    templateUrl: './books.component.html',
    styleUrls: ['./books.component.css']
})
export default class BooksComponent implements OnInit, AfterViewInit, OnDestroy {
  books: Book[] = [];
  title: string = "Book recommendations";

  pageSize = 5;
  itemsToShow = 5;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadBooks();
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
    if (this.itemsToShow < this.books.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  loadBooks(): void {
    this.http.get<{ books: Book[] }>('assets/data/books.json').subscribe({
      next: (data) => {
        this.books = data.books;
        this.getRatings();
      },
      error: (err) => {
        console.error('Failed to load books:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.books.map(books => books.id))
      .subscribe(bookRatings => {
        this.books = this.books.map(books => {
          const ratingData = bookRatings.find(rating => rating.id === books.id);
          if (ratingData) {
            books.rating = ratingData.ratings;
          } else {
            books.rating = [0,0,0,0,0,0];
          }
          return books;
        });
      });
  }
}
