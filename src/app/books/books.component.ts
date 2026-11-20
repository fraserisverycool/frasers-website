import {Component, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {Book} from "./book.interface";
import {RatingBarComponent} from "../utils/rating-bar/rating-bar.component";
import {SpoilerDiscussionComponent} from "../utils/spoiler-discussion/spoiler-discussion.component";
import {BookService} from "./service/book.service";
import {InfiniteScrollDirective} from "../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-books',
    imports: [CommonModule, NgOptimizedImage, RatingBarComponent, SpoilerDiscussionComponent, InfiniteScrollDirective, ImageUrlPipe],
    templateUrl: './books.component.html',
    styleUrls: ['./books.component.css']
})
export default class BooksComponent implements OnInit {
  books: Book[] = [];
  title: string = "Book recommendations";

  pageSize = 5;
  itemsToShow = 5;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadMore(): void {
    if (this.itemsToShow < this.books.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
      },
      error: (err) => {
        console.error('Failed to load books:', err);
      },
    });
  }
}
