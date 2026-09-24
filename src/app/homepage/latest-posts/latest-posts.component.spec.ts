import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LatestPostsComponent } from './latest-posts.component';

describe('LatestPostsComponent', () => {
  let component: LatestPostsComponent;
  let fixture: ComponentFixture<LatestPostsComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestPostsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LatestPostsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create and load 15 latest posts sorted by date descending', () => {
    fixture.detectChanges();

    const mockGames = {
      games: [
        { id: '1', name: 'Game A', review: 'Review A', image: 'gameA.jpg', vibes: 10, gameplay: 9, platform: 'Switch', release: 2023, timestamp: '10-01-2025' },
        { id: '2', name: 'Game B', review: 'Review B', image: 'gameB.jpg', vibes: 8, gameplay: 8, platform: 'PC', release: 2024, timestamp: '20-03-2025' }
      ]
    };

    const mockFilms = {
      films: [
        { id: '3', title: 'Film A', description: ['Film desc A'], filename: 'filmA.jpg', release: '2023', spoiler: false, timestamp: '15-02-2025' }
      ]
    };

    // Respond to all 16 requests
    httpTestingController.expectOne('assets/data/games.json').flush(mockGames);
    httpTestingController.expectOne('assets/data/films.json').flush(mockFilms);
    httpTestingController.expectOne('assets/data/albums.json').flush({ albums: [] });
    httpTestingController.expectOne('assets/data/playlists.json').flush({ playlists: [] });
    httpTestingController.expectOne('assets/data/soundtracks.json').flush({ soundtracks: [] });
    httpTestingController.expectOne('assets/data/concerts.json').flush({ concerts: [] });
    httpTestingController.expectOne('assets/data/books.json').flush({ books: [] });
    httpTestingController.expectOne('assets/data/photos.json').flush({ pictures: [] });
    httpTestingController.expectOne('assets/data/videos.json').flush({ videos: [] });
    httpTestingController.expectOne('assets/data/cds.json').flush({ cds: [] });
    httpTestingController.expectOne('assets/data/durstloescher.json').flush({ durstloescher: [] });
    httpTestingController.expectOne('assets/data/characters.json').flush({ characters: [] });
    httpTestingController.expectOne('assets/data/mariokart.json').flush({ tracks: [] });
    httpTestingController.expectOne('assets/data/stitches.json').flush({ stitches: [] });
    httpTestingController.expectOne('assets/data/mixes.json').flush({ mixes: [] });
    httpTestingController.expectOne('assets/data/kk.json').flush({ kkSongs: [] });

    expect(component).toBeTruthy();
    expect(component.posts.length).toBe(3);
    expect(component.posts[0].title).toBe('Game B');
    expect(component.posts[1].title).toBe('Film A');
    expect(component.posts[2].title).toBe('Game A');
  });
});
