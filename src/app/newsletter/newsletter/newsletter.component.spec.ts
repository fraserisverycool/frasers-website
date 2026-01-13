import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import NewsletterComponent from './newsletter.component';

describe('NewsletterComponent', () => {
  let component: NewsletterComponent;
  let fixture: ComponentFixture<NewsletterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NewsletterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(NewsletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
