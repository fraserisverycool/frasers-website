import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameService } from './game.service';
import { RatingHydrationService } from '../../utils/rating-bar/service/rating-hydration.service';
import { of } from 'rxjs';
import { Game } from '../game.interface';

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;
  let ratingHydrationSpy: jasmine.SpyObj<RatingHydrationService>;

  const mockRawGames = [
    {
      id: 'game-1',
      name: 'Super Mario 64',
      review: ['Great game!'],
      vibes: '10',
      gameplay: '9',
      image: 'mario.png',
      platform: 'Nintendo 64',
      year: '1996',
      release: 1996,
      story: false,
      score: 19,
      completed: true,
      completable: true,
      newsletter: true
    },
    {
      id: 'game-2',
      name: 'Unreviewed game',
      review: []
    }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('RatingHydrationService', ['hydrateRatings']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GameService,
        { provide: RatingHydrationService, useValue: spy }
      ]
    });

    service = TestBed.inject(GameService);
    httpMock = TestBed.inject(HttpTestingController);
    ratingHydrationSpy = TestBed.inject(RatingHydrationService) as jasmine.SpyObj<RatingHydrationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should filter games without reviews, parse vibes/gameplay, and hydrate ratings', (done) => {
    ratingHydrationSpy.hydrateRatings.and.callFake((games: any) => of(games));

    service.getGames().subscribe(games => {
      expect(games.length).toBe(1);
      expect(games[0].id).toBe('game-1');
      expect(games[0].vibes).toBe(10);
      expect(games[0].gameplay).toBe(9);
      expect(ratingHydrationSpy.hydrateRatings).toHaveBeenCalled();
      done();
    });

    const req = httpMock.expectOne('assets/data/games.json');
    expect(req.request.method).toBe('GET');
    req.flush({ games: mockRawGames });
  });
});
