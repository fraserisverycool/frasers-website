import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RatingHydrationService, enrichWithRatings } from './rating-hydration.service';
import { RatingService } from './rating.service';
import { RateableEntity } from './rateable-entity.interface';
import { Rating } from './rating.interface';

describe('RatingHydrationService', () => {
  let service: RatingHydrationService;
  let ratingServiceSpy: jasmine.SpyObj<RatingService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('RatingService', ['getRatingsById']);
    TestBed.configureTestingModule({
      providers: [
        RatingHydrationService,
        { provide: RatingService, useValue: spy }
      ]
    });
    service = TestBed.inject(RatingHydrationService);
    ratingServiceSpy = TestBed.inject(RatingService) as jasmine.SpyObj<RatingService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array for empty items', (done) => {
    service.hydrateRatings([]).subscribe(res => {
      expect(res).toEqual([]);
      expect(ratingServiceSpy.getRatingsById).not.toHaveBeenCalled();
      done();
    });
  });

  it('should hydrate ratings for items from RatingService', (done) => {
    const items: RateableEntity[] = [
      { id: '1', title: 'Film 1' },
      { id: '2', title: 'Film 2' }
    ];

    const mockRatings: Rating[] = [
      { id: '1', ratings: [1, 2, 3, 4, 5, 6] }
    ];

    ratingServiceSpy.getRatingsById.and.returnValue(of(mockRatings));

    service.hydrateRatings(items).subscribe(res => {
      expect(res.length).toBe(2);
      expect(res[0].rating).toEqual([1, 2, 3, 4, 5, 6]);
      expect(res[1].rating).toEqual([0, 0, 0, 0, 0, 0]);
      expect(ratingServiceSpy.getRatingsById).toHaveBeenCalledWith(['1', '2']);
      done();
    });
  });

  it('should fallback to default rating array if RatingService fails', (done) => {
    const items: RateableEntity[] = [
      { id: '1', title: 'Film 1' }
    ];

    ratingServiceSpy.getRatingsById.and.returnValue(throwError(() => new Error('Network error')));

    service.hydrateRatings(items).subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].rating).toEqual([0, 0, 0, 0, 0, 0]);
      done();
    });
  });

  it('should work with enrichWithRatings RxJS operator', (done) => {
    const items: RateableEntity[] = [
      { id: 'item-1', name: 'Item 1' }
    ];
    ratingServiceSpy.getRatingsById.and.returnValue(of([{ id: 'item-1', ratings: [5, 4, 3, 2, 1, 0] }]));

    of(items).pipe(
      enrichWithRatings(service)
    ).subscribe(result => {
      expect(result[0].rating).toEqual([5, 4, 3, 2, 1, 0]);
      done();
    });
  });
});
