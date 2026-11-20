import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import GuestbookComponent from './guestbook.component';
import { GuestbookService } from './service/guestbook.service';
import { Feedback } from './feedback.interface';

describe('GuestbookComponent', () => {
  let component: GuestbookComponent;
  let fixture: ComponentFixture<GuestbookComponent>;
  let serviceSpy: jasmine.SpyObj<GuestbookService>;

  const existing: Feedback = { id: 1, comment: 'old', name: 'Ann', color: '#ffffff', timestamp: '2026-01-01' };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('GuestbookService', ['getFeedback', 'postFeedback']);
    serviceSpy.getFeedback.and.returnValue(of([existing]));
    TestBed.configureTestingModule({
      imports: [GuestbookComponent],
      providers: [{ provide: GuestbookService, useValue: serviceSpy }]
    });
    fixture = TestBed.createComponent(GuestbookComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function setField(selector: string, value: string) {
    const el = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    el.value = value;
    el.dispatchEvent(new Event('input'));
  }

  it('should create and show loaded feedback', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('old');
  });

  it('does not submit when required fields are empty', async () => {
    fixture.nativeElement.querySelector('button[type=submit]').click();
    await fixture.whenStable();
    expect(serviceSpy.postFeedback).not.toHaveBeenCalled();
  });

  it('submits via the signal form, prepends the response and resets the form', async () => {
    const created: Feedback = { id: 2, comment: 'hello', name: 'Bob', color: '#3498db', timestamp: '2026-02-02' };
    serviceSpy.postFeedback.and.returnValue(of(created));

    setField('#comment', 'hello');
    setField('#name', 'Bob');
    component.selectColor('#3498db');
    expect(component.newFeedback()).toEqual({ comment: 'hello', name: 'Bob', color: '#3498db' });

    fixture.nativeElement.querySelector('button[type=submit]').click();
    await fixture.whenStable();

    expect(serviceSpy.postFeedback).toHaveBeenCalledWith({ comment: 'hello', name: 'Bob', color: '#3498db' });
    expect(component.feedbacks()[0]).toEqual(created);
    expect(component.newFeedback()).toEqual({ comment: '', name: '', color: '#ffffff' });
    expect(fixture.nativeElement.textContent).toContain('hello');
  });
});
