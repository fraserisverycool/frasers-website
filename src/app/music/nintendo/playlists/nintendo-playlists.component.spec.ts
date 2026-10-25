import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import NintendoPlaylistsComponent from './nintendo-playlists.component';
import { NintendoPlaylist } from './nintendo-playlist.interface';

describe('NintendoPlaylistsComponent', () => {
  let component: NintendoPlaylistsComponent;
  let fixture: ComponentFixture<NintendoPlaylistsComponent>;
  let httpMock: HttpTestingController;

  const mockPlaylists: NintendoPlaylist[] = [
    {
      id: '1',
      name: 'Underrated Huge Hits',
      description: 'A curated playlist of lesser-known bangers.',
      image: 'underrated-huge-hits.png',
      link: 'https://music.nintendo.com/playlist-1',
      timestamp: '18-10-2026',
      rating: [0, 0, 0, 0, 0, 0]
    },
    {
      id: '2',
      name: 'All Time Faves',
      description: 'Just some of my favourite tracks.',
      image: 'all-time-faves.png',
      link: 'https://music.nintendo.com/playlist-2',
      timestamp: '18-10-2026',
      rating: [0, 0, 0, 0, 0, 0]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NintendoPlaylistsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    fixture = TestBed.createComponent(NintendoPlaylistsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load playlists', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('assets/data/nintendo-playlists.json');
    expect(req.request.method).toBe('GET');
    req.flush({ playlists: mockPlaylists });

    const ratingReq = httpMock.expectOne('https://worldpeace.services/api/rating/get');
    expect(ratingReq.request.method).toBe('POST');
    ratingReq.flush([]);

    expect(component).toBeTruthy();
    expect(component.playlists.length).toBe(2);
  });

  it('should filter playlists by name and description', () => {
    component.originalPlaylists = mockPlaylists;
    component.playlists = [...mockPlaylists];

    component.searchTerm = 'bangers';
    expect(component.filteredPlaylists.length).toBe(1);
    expect(component.filteredPlaylists[0].name).toBe('Underrated Huge Hits');

    component.searchTerm = 'Faves';
    expect(component.filteredPlaylists.length).toBe(1);
    expect(component.filteredPlaylists[0].name).toBe('All Time Faves');
  });

  it('should sort playlists alphabetically', () => {
    component.originalPlaylists = [...mockPlaylists];
    component.playlists = [...mockPlaylists];

    component.sortPlaylists('alphabetical');
    expect(component.playlists[0].name).toBe('All Time Faves');
    expect(component.playlists[1].name).toBe('Underrated Huge Hits');

    component.sortPlaylists('default');
    expect(component.playlists[0].name).toBe('Underrated Huge Hits');
  });
});
