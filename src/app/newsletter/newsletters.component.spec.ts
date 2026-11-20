import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import NewslettersComponent from './newsletters.component';
import { NewsletterService } from './service/newsletter.service';

describe('NewslettersComponent', () => {
  let component: NewslettersComponent;
  let fixture: ComponentFixture<NewslettersComponent>;
  let newsletterServiceSpy: jasmine.SpyObj<NewsletterService>;

  beforeEach(() => {
    newsletterServiceSpy = jasmine.createSpyObj('NewsletterService', ['getNewsletters']);
    newsletterServiceSpy.getNewsletters.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [NewslettersComponent],
      providers: [
        provideRouter([]),
        { provide: NewsletterService, useValue: newsletterServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(NewslettersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
