import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FilmService } from './film.service';
import { RatingHydrationService } from '../../utils/rating-bar/service/rating-hydration.service';
import { of } from 'rxjs';
import { Film } from '../film.interface';

describe('FilmService', () => {
  let service: FilmService;
  let httpMock: HttpTestingController;
  let ratingHydrationSpy: jasmine.SpyObj<RatingHydrationService>;

  const mockFilms: Film[] = [
    {
      id: 'film-1',
      title: 'The Matrix',
      description: 'Sci-fi classic',
      filename: 'matrix.jpg',
      year: '1999',
      release: 1999,
      tv: false,
      seasons: [],
      rating: [0, 0, 0, 0, 0, 0],
      newsletter: true
    }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('RatingHydrationService', ['hydrateRatings']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FilmService,
        { provide: RatingHydrationService, useValue: spy }
      ]
    });

    service = TestBed.inject(FilmService);
    httpMock = TestBed.inject(HttpTestingController);
    ratingHydrationSpy = TestBed.inject(RatingHydrationService) as jasmine.SpyObj<RatingHydrationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch films and hydrate ratings by default', (done) => {
    ratingHydrationSpy.hydrateRatings.and.returnValue(of(mockFilms));

    service.getFilms().subscribe(films => {
      expect(films).toEqual(mockFilms);
      expect(ratingHydrationSpy.hydrateRatings).toHaveBeenCalledWith(mockFilms);
      done();
    });

    const req = httpMock.expectOne('assets/data/films.json');
    expect(req.request.method).toBe('GET');
    req.flush({ films: mockFilms });
  });

  it('should fetch raw films without hydration when hydrateRatings is false', (done) => {
    service.getFilms(false).subscribe(films => {
      expect(films).toEqual(mockFilms);
      expect(ratingHydrationSpy.hydrateRatings).not.toHaveBeenCalled();
      done();
    });

    const req = httpMock.expectOne('assets/data/films.json');
    expect(req.request.method).toBe('GET');
    req.flush({ films: mockFilms });
  });
});
