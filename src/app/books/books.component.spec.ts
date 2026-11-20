import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import BooksComponent from './books.component';
import { BookService } from './service/book.service';

describe('BooksComponent', () => {
  let component: BooksComponent;
  let fixture: ComponentFixture<BooksComponent>;
  let bookServiceSpy: jasmine.SpyObj<BookService>;

  beforeEach(() => {
    bookServiceSpy = jasmine.createSpyObj('BookService', ['getBooks']);
    bookServiceSpy.getBooks.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [BooksComponent],
      providers: [
        { provide: BookService, useValue: bookServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(BooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
