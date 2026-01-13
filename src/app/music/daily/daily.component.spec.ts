import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DailyComponent } from './daily.component';

describe('DailyComponent', () => {
  let component: DailyComponent;
  let fixture: ComponentFixture<DailyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DailyComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(DailyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
