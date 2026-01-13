import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import SoundtracksComponent from './soundtracks.component';

describe('SoundtracksComponent', () => {
  let component: SoundtracksComponent;
  let fixture: ComponentFixture<SoundtracksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SoundtracksComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(SoundtracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
