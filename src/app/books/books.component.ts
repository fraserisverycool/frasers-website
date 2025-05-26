import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {Book} from "./book.interface";

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export default class BooksComponent implements OnInit {
  books: Book[] = [];
  title: string = "Book recommendations";

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.http.get<{ books: Book[] }>('assets/books/books.json').subscribe({
      next: (data) => {
        this.books = data.books;
      },
      error: (err) => {
        console.error('Failed to load books:', err);
      },
    });
  }
}
