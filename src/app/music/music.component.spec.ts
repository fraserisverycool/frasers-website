import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import MusicComponent from './music.component';

describe('MusicComponent', () => {
  let component: MusicComponent;
  let fixture: ComponentFixture<MusicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MusicComponent],
      providers: [provideRouter([])]
    });
    fixture = TestBed.createComponent(MusicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
