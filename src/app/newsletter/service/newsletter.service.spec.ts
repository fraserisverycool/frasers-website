import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NewsletterService } from './newsletter.service';
import { RatingHydrationService } from '../../utils/rating-bar/service/rating-hydration.service';
import { of } from 'rxjs';
import { Newsletter } from '../newsletter.interface';

describe('NewsletterService', () => {
  let service: NewsletterService;
  let httpMock: HttpTestingController;
  let ratingHydrationSpy: jasmine.SpyObj<RatingHydrationService>;

  const mockNewsletter1: Newsletter = {
    id: 'news-1',
    timestamp: '01-01-2026',
    title: 'Newsletter 1',
    description: ['First'],
    entries: [],
    rating: [0, 0, 0, 0, 0, 0]
  };

  const mockNewsletter2: Newsletter = {
    id: 'news-2',
    timestamp: '02-01-2026',
    title: 'Newsletter 2',
    description: ['Second'],
    entries: [],
    rating: [0, 0, 0, 0, 0, 0]
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('RatingHydrationService', ['hydrateRatings']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NewsletterService,
        { provide: RatingHydrationService, useValue: spy }
      ]
    });

    service = TestBed.inject(NewsletterService);
    httpMock = TestBed.inject(HttpTestingController);
    ratingHydrationSpy = TestBed.inject(RatingHydrationService) as jasmine.SpyObj<RatingHydrationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch single newsletter by timestamp', (done) => {
    service.getNewsletterByTimestamp('01-01-2026').subscribe(res => {
      expect(res).toEqual(mockNewsletter1);
      done();
    });

    const req = httpMock.expectOne('assets/newsletter/newsletter-01-01-2026.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockNewsletter1);
  });

  it('should fetch all newsletters, sort by timestamp desc, and hydrate ratings', (done) => {
    ratingHydrationSpy.hydrateRatings.and.callFake((items: any) => of(items));

    service.getNewsletters().subscribe(res => {
      expect(res.length).toBe(2);
      expect(res[0].id).toBe('news-2'); // Later date first
      expect(res[1].id).toBe('news-1');
      expect(ratingHydrationSpy.hydrateRatings).toHaveBeenCalled();
      done();
    });

    const listReq = httpMock.expectOne('assets/data/newsletters.json');
    listReq.flush({ newsletters: ['newsletter-01-01-2026.json', 'newsletter-02-01-2026.json'] });

    const n1Req = httpMock.expectOne('assets/newsletter/newsletter-01-01-2026.json');
    n1Req.flush(mockNewsletter1);

    const n2Req = httpMock.expectOne('assets/newsletter/newsletter-02-01-2026.json');
    n2Req.flush(mockNewsletter2);
  });
});
