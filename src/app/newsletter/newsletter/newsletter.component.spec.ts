import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import NewsletterComponent from './newsletter.component';
import { NewsletterService } from '../service/newsletter.service';

describe('NewsletterComponent', () => {
  let component: NewsletterComponent;
  let fixture: ComponentFixture<NewsletterComponent>;
  let newsletterServiceSpy: jasmine.SpyObj<NewsletterService>;

  beforeEach(() => {
    newsletterServiceSpy = jasmine.createSpyObj('NewsletterService', ['getNewsletterByTimestamp']);
    newsletterServiceSpy.getNewsletterByTimestamp.and.returnValue(of(null));

    TestBed.configureTestingModule({
      imports: [NewsletterComponent],
      providers: [
        provideRouter([]),
        { provide: NewsletterService, useValue: newsletterServiceSpy }
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
