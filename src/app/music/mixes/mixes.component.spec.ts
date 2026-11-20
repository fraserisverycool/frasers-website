import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import MixesComponent from './mixes.component';
import { MusicService } from '../service/music.service';

describe('MixesComponent', () => {
  let component: MixesComponent;
  let fixture: ComponentFixture<MixesComponent>;
  let musicServiceSpy: jasmine.SpyObj<MusicService>;

  beforeEach(() => {
    musicServiceSpy = jasmine.createSpyObj('MusicService', ['getMixes']);
    musicServiceSpy.getMixes.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [MixesComponent],
      providers: [
        { provide: MusicService, useValue: musicServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(MixesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render audio players for selected mix in modal', () => {
    component.selectedMix = {
      id: '1',
      name: 'Mix 1',
      description: 'Desc 1',
      filename: 'mix1.mp3',
      image: 'placeholder.jpg',
      rating: [5,5,5,5,5,5],
      newsletter: false
    };
    fixture.detectChanges();
    const audioElements = fixture.nativeElement.querySelectorAll('audio');
    expect(audioElements.length).toBeGreaterThan(0);
    expect(audioElements[0].src).toContain('mix1.mp3');
  });
});
