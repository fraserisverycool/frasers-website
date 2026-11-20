import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import ConcertsComponent from './concerts.component';
import { MusicService } from '../service/music.service';

describe('ConcertsComponent', () => {
  let component: ConcertsComponent;
  let fixture: ComponentFixture<ConcertsComponent>;
  let musicServiceSpy: jasmine.SpyObj<MusicService>;

  beforeEach(() => {
    musicServiceSpy = jasmine.createSpyObj('MusicService', ['getConcerts']);
    musicServiceSpy.getConcerts.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [ConcertsComponent],
      providers: [
        { provide: MusicService, useValue: musicServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(ConcertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
