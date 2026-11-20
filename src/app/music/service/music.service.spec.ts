import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MusicService} from './music.service';
import {RatingHydrationService} from '../../utils/rating-bar/service/rating-hydration.service';
import {of} from 'rxjs';

describe('MusicService', () => {
  let service: MusicService;
  let httpMock: HttpTestingController;
  let ratingHydrationSpy: jasmine.SpyObj<RatingHydrationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('RatingHydrationService', ['hydrateRatings']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MusicService,
        { provide: RatingHydrationService, useValue: spy }
      ]
    });

    service = TestBed.inject(MusicService);
    httpMock = TestBed.inject(HttpTestingController);
    ratingHydrationSpy = TestBed.inject(RatingHydrationService) as jasmine.SpyObj<RatingHydrationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch albums and hydrate ratings', (done) => {
    const mockAlbums: any[] = [{ id: 'album-1', title: 'Album 1' }];
    ratingHydrationSpy.hydrateRatings.and.returnValue(of(mockAlbums));

    service.getAlbums().subscribe(res => {
      expect(res).toEqual(mockAlbums);
      expect(ratingHydrationSpy.hydrateRatings).toHaveBeenCalledWith(mockAlbums);
      done();
    });

    const req = httpMock.expectOne('assets/data/albums.json');
    expect(req.request.method).toBe('GET');
    req.flush({ albums: mockAlbums });
  });

  it('should fetch nintendo playlists', (done) => {
    const mockPlaylists: any[] = [{ id: 'np-1', name: 'Playlist 1' }];
    ratingHydrationSpy.hydrateRatings.and.returnValue(of(mockPlaylists));

    service.getNintendoPlaylists().subscribe(res => {
      expect(res).toEqual(mockPlaylists);
      done();
    });

    const req = httpMock.expectOne('assets/data/nintendo-playlists.json');
    expect(req.request.method).toBe('GET');
    req.flush({ playlists: mockPlaylists });
  });
});
