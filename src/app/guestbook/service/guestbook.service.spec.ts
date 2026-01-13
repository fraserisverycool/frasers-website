import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GuestbookService } from './guestbook.service';
import { environment } from '../../../environments/environment';
import { Feedback } from '../feedback.interface';

describe('GuestbookService', () => {
  let service: GuestbookService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GuestbookService]
    });
    service = TestBed.inject(GuestbookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch feedback via GET', () => {
    const mockFeedbacks: Feedback[] = [
      { id: 1, name: 'Fraser', comment: 'Hello!', color: '#ffffff', timestamp: '2024-01-01' },
      { id: 2, name: 'Anni', comment: 'Hi!', color: '#000000', timestamp: '2024-01-02' }
    ];

    service.getFeedback().subscribe(feedbacks => {
      expect(feedbacks.length).toBe(2);
      expect(feedbacks).toEqual(mockFeedbacks);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/feedback`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFeedbacks);
  });

  it('should post feedback via POST', () => {
    const newFeedback = { name: 'New User', comment: 'Awesome site!' };
    const mockResponse: Feedback = { id: 3, ...newFeedback, color: '#ffffff', timestamp: '2024-01-03' };

    service.postFeedback(newFeedback).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/feedback`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newFeedback);
    req.flush(mockResponse);
  });
});
