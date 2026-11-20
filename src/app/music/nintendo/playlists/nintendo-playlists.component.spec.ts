import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import NintendoPlaylistsComponent from './nintendo-playlists.component';
import { NintendoPlaylist } from './nintendo-playlist.interface';
import { MusicService } from '../../service/music.service';

describe('NintendoPlaylistsComponent', () => {
  let component: NintendoPlaylistsComponent;
  let fixture: ComponentFixture<NintendoPlaylistsComponent>;
  let musicServiceSpy: jasmine.SpyObj<MusicService>;

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
    musicServiceSpy = jasmine.createSpyObj('MusicService', ['getNintendoPlaylists']);
    musicServiceSpy.getNintendoPlaylists.and.returnValue(of(mockPlaylists));

    TestBed.configureTestingModule({
      imports: [NintendoPlaylistsComponent],
      providers: [
        provideRouter([]),
        { provide: MusicService, useValue: musicServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(NintendoPlaylistsComponent);
    component = fixture.componentInstance;
  });

  it('should create and load playlists', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.playlists().length).toBe(2);
    expect(musicServiceSpy.getNintendoPlaylists).toHaveBeenCalled();
  });

  it('should filter playlists by name and description', () => {
    component.originalPlaylists.set(mockPlaylists);
    component.playlists.set([...mockPlaylists]);

    component.searchTerm.set('bangers');
    expect(component.filteredPlaylists().length).toBe(1);
    expect(component.filteredPlaylists()[0].name).toBe('Underrated Huge Hits');

    component.searchTerm.set('Faves');
    expect(component.filteredPlaylists().length).toBe(1);
    expect(component.filteredPlaylists()[0].name).toBe('All Time Faves');
  });

  it('should sort playlists alphabetically', () => {
    component.originalPlaylists.set([...mockPlaylists]);
    component.playlists.set([...mockPlaylists]);

    component.sortPlaylists('alphabetical');
    expect(component.playlists()[0].name).toBe('All Time Faves');
    expect(component.playlists()[1].name).toBe('Underrated Huge Hits');

    component.sortPlaylists('default');
    expect(component.playlists()[0].name).toBe('Underrated Huge Hits');
  });
});
