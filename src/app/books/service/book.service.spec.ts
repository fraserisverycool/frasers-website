import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookService } from './book.service';
import { RatingHydrationService } from '../../utils/rating-bar/service/rating-hydration.service';
import { of } from 'rxjs';
import { Book } from '../book.interface';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;
  let ratingHydrationSpy: jasmine.SpyObj<RatingHydrationService>;

  const mockBooks: Book[] = [
    {
      id: 'book-1',
      title: 'Sample Book',
      author: 'Author',
      description: 'Book description',
      filename: 'book.jpg',
      release: 2024,
      spoiler: 'spoiler',
      rating: [0, 0, 0, 0, 0, 0],
      newsletter: true
    }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('RatingHydrationService', ['hydrateRatings']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BookService,
        { provide: RatingHydrationService, useValue: spy }
      ]
    });

    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
    ratingHydrationSpy = TestBed.inject(RatingHydrationService) as jasmine.SpyObj<RatingHydrationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch books and hydrate ratings', (done) => {
    ratingHydrationSpy.hydrateRatings.and.returnValue(of(mockBooks));

    service.getBooks().subscribe(books => {
      expect(books).toEqual(mockBooks);
      expect(ratingHydrationSpy.hydrateRatings).toHaveBeenCalledWith(mockBooks);
      done();
    });

    const req = httpMock.expectOne('assets/data/books.json');
    expect(req.request.method).toBe('GET');
    req.flush({ books: mockBooks });
  });
});
