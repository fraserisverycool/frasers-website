import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import DailiesComponent from './dailies.component';
import { DailySoundtrack } from '../daily-soundtrack.interface';

describe('DailiesComponent', () => {
  let component: DailiesComponent;
  let fixture: ComponentFixture<DailiesComponent>;
  let httpMock: HttpTestingController;

  const track = (id: string, artist: string, album: string, trackName: string, day: string): DailySoundtrack => ({
    id, artist, album, track: trackName, day, description: '', link: '', filename: `${id}.mp3`,
    game: false, tags: [], rating: [0, 0, 0, 0, 0, 0], newsletter: false
  });

  const soundtracks = [
    track('1', 'Radiohead', 'OK Computer', 'Paranoid Android', '01-01-2024'),
    track('2', 'Norah Jones', 'Come Away With Me', "Don't Know Why", '02-01-2024'),
    track('3', 'Koji Kondo', 'Ocarina of Time', 'Song of Storms', '03-01-2024'),
  ];

  beforeEach(async () => {
    localStorage.removeItem('dailies_player_state');
    TestBed.configureTestingModule({
      imports: [DailiesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DailiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne('assets/data/daily-soundtracks.json').flush({ dailysoundtracks: soundtracks });
    httpMock.match(() => true).forEach(req => req.flush([]));
    await fixture.whenStable();
  });

  afterEach(() => localStorage.removeItem('dailies_player_state'));

  const visibleIds = () => component.paginatedGroups().flatMap(g => g.tracks).map(t => t.id);

  it('should create and show all past tracks', () => {
    expect(component).toBeTruthy();
    expect(visibleIds().sort()).toEqual(['1', '2', '3']);
  });

  it('filters by artist, album and track name, case-insensitively', () => {
    component.search('radiohead');
    expect(visibleIds()).toEqual(['1']);

    component.search('ocarina');
    expect(visibleIds()).toEqual(['3']);

    component.search("DON'T KNOW");
    expect(visibleIds()).toEqual(['2']);
    expect(component.playlist().map(t => t.id)).toEqual(['2']);
  });

  it('restores the full list when the search is cleared', () => {
    component.search('radiohead');
    component.search('');
    expect(visibleIds().sort()).toEqual(['1', '2', '3']);
  });

  it('updates the list when typing in the search box', async () => {
    const input = fixture.nativeElement.querySelector('.search-container input') as HTMLInputElement;
    input.value = 'storms';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(component.searchTerm()).toBe('storms');
    expect(visibleIds()).toEqual(['3']);
    expect(fixture.nativeElement.textContent).toContain('Song of Storms');
    expect(fixture.nativeElement.textContent).not.toContain('Paranoid Android');
  });
});
