import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import AlbumsComponent from './albums.component';
import { MusicService } from '../service/music.service';

describe('AlbumsComponent', () => {
  let component: AlbumsComponent;
  let fixture: ComponentFixture<AlbumsComponent>;
  let musicServiceSpy: jasmine.SpyObj<MusicService>;

  beforeEach(() => {
    musicServiceSpy = jasmine.createSpyObj('MusicService', ['getAlbums']);
    musicServiceSpy.getAlbums.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [AlbumsComponent],
      providers: [
        { provide: MusicService, useValue: musicServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(AlbumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
