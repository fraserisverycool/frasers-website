import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import CdsComponent from './cds.component';
import { MusicService } from '../service/music.service';

describe('CdsComponent', () => {
  let component: CdsComponent;
  let fixture: ComponentFixture<CdsComponent>;
  let musicServiceSpy: jasmine.SpyObj<MusicService>;

  beforeEach(() => {
    musicServiceSpy = jasmine.createSpyObj('MusicService', ['getCds']);
    musicServiceSpy.getCds.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [CdsComponent],
      providers: [
        { provide: MusicService, useValue: musicServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(CdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
