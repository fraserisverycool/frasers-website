import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage, NgStyle } from '@angular/common';
import { catchError, of } from 'rxjs';
import {Book} from "./book.interface";
import {RatingBarComponent} from "../utils/rating-bar/rating-bar.component";
import {SpoilerDiscussionComponent} from "../utils/spoiler-discussion/spoiler-discussion.component";
import {BookService} from "./service/book.service";
import {InfiniteScrollDirective} from "../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-books',
    imports: [NgOptimizedImage, NgStyle, RatingBarComponent, SpoilerDiscussionComponent, InfiniteScrollDirective, ImageUrlPipe],
    templateUrl: './books.component.html',
    styleUrls: ['./books.component.css']
})
export default class BooksComponent {
  private bookService = inject(BookService);

  readonly books = toSignal(
    this.bookService.getBooks().pipe(
      catchError(err => {
        console.error('Failed to load books:', err);
        return of([] as Book[]);
      })
    ),
    { initialValue: [] as Book[] }
  );
  readonly title = "Book recommendations";

  private readonly pageSize = 5;
  readonly itemsToShow = signal(this.pageSize);
  readonly visibleBooks = computed(() => this.books().slice(0, this.itemsToShow()));

  loadMore(): void {
    if (this.itemsToShow() < this.books().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }
}
