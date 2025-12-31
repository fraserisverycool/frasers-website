import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
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
export default class BooksComponent implements OnInit {
  books: Book[] = [];
  title: string = "Book recommendations";

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadBooks();
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
